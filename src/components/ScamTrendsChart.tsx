import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BarChart3 } from 'lucide-react';
import type { HistoryEntry, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { buildScamTrendData } from '../utils/scamTrends';
import type { ScamTrendDatum } from '../utils/scamTrends';

interface ScamTrendsChartProps {
  history: HistoryEntry[];
  language: Language;
}

export function ScamTrendsChart({ history, language }: ScamTrendsChartProps) {
  const t = TRANSLATIONS[language].results.trends;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(540);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const data = useMemo(
    () => buildScamTrendData(history, t.categories),
    [history, t.categories]
  );

  const totalChecks = history.length;
  const totalRisky = useMemo(
    () =>
      history.filter(
        (entry) =>
          entry.result.verdict === 'STOP' || entry.result.verdict === 'WAIT'
      ).length,
    [history]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const next = Math.max(260, Math.floor(container.clientWidth));
      setChartWidth(next);
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const lastRenderedSignatureRef = useRef<string>('');

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || data.length === 0) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const dataSignature = data.map((d) => `${d.key}:${d.count}`).join('|');
    const shouldAnimate =
      !prefersReducedMotion && lastRenderedSignatureRef.current !== dataSignature;
    lastRenderedSignatureRef.current = dataSignature;

    const margin = { top: 6, right: 8, bottom: 28, left: 4 };
    const innerWidth = Math.max(200, chartWidth - margin.left - margin.right);
    const rowHeight = 62;
    const barHeight = 20;
    const innerHeight = data.length * rowHeight;
    const totalHeight = margin.top + innerHeight + margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', `0 0 ${chartWidth} ${totalHeight}`)
      .attr('width', chartWidth)
      .attr('height', totalHeight);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(1, totalChecks)])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.key))
      .range([0, innerHeight])
      .paddingInner(0.18);

    // Subtle vertical percentage grid lines (0%, 50%, 100%)
    const gridValues = [0, Math.max(1, totalChecks) * 0.5, Math.max(1, totalChecks)];
    g.append('g')
      .attr('class', 'trend-grid')
      .selectAll('line')
      .data(gridValues)
      .join('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight - 6)
      .attr('stroke', '#18181B')
      .attr('stroke-opacity', 0.1)
      .attr('stroke-dasharray', '3,4');

    // D3 bottom axis showing share of total local checks
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(gridValues)
      .tickSize(4)
      .tickPadding(8)
      .tickFormat((val) => {
        const pct = Math.round((Number(val) / Math.max(1, totalChecks)) * 100);
        return `${pct}%`;
      });

    const axisGroup = g
      .append('g')
      .attr('transform', `translate(0, ${innerHeight - 2})`)
      .call(xAxis);

    axisGroup.select('.domain').attr('stroke', '#18181B').attr('stroke-opacity', 0.25);
    axisGroup.selectAll('.tick line').attr('stroke', '#18181B').attr('stroke-opacity', 0.25);
    axisGroup
      .selectAll('.tick text')
      .attr('fill', '#52525B')
      .attr('font-size', '13px')
      .attr('font-weight', '700')
      .style('font-variant-numeric', 'tabular-nums');

    const rows = g
      .selectAll<SVGGElement, ScamTrendDatum>('g.trend-row')
      .data(data, (d) => d.key)
      .join('g')
      .attr('class', 'trend-row')
      .attr('transform', (d) => `translate(0, ${yScale(d.key) ?? 0})`)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        setActiveKey((prev) => (prev === d.key ? null : d.key));
      })
      .on('mouseenter', (_event, d) => {
        setActiveKey(d.key);
      })
      .on('mouseleave', () => {
        setActiveKey(null);
      });

    // Category label (top-left of row)
    rows
      .append('text')
      .attr('x', 2)
      .attr('y', 16)
      .attr('fill', '#18181B')
      .attr('font-size', chartWidth < 400 ? '15px' : '16px')
      .attr('font-weight', '800')
      .text((d) => d.label);

    // Count & percentage value (top-right of row, tabular)
    rows
      .append('text')
      .attr('x', innerWidth - 2)
      .attr('y', 16)
      .attr('text-anchor', 'end')
      .attr('fill', '#18181B')
      .attr('font-size', chartWidth < 400 ? '15px' : '16px')
      .attr('font-weight', '800')
      .style('font-variant-numeric', 'tabular-nums')
      .text((d) => `${d.count} · ${d.percentage}%`);

    // Full-width track behind bar
    rows
      .append('rect')
      .attr('x', 0)
      .attr('y', 25)
      .attr('width', innerWidth)
      .attr('height', barHeight)
      .attr('rx', 10)
      .attr('fill', '#FAF5F0')
      .attr('stroke', '#18181B')
      .attr('stroke-opacity', 0.22)
      .attr('stroke-width', 1.4);

    // Filled D3 value bar
    const bars = rows
      .append('rect')
      .attr('class', 'trend-bar')
      .attr('x', 0)
      .attr('y', 25)
      .attr('height', barHeight)
      .attr('rx', 10)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#18181B')
      .attr('stroke-width', 1.8)
      .attr('opacity', 1);

    if (shouldAnimate) {
      bars
        .attr('width', 0)
        .transition()
        .duration(420)
        .ease(d3.easeCubicOut)
        .attr('width', (d) => Math.max(12, xScale(d.count)));
    } else {
      bars.attr('width', (d) => Math.max(12, xScale(d.count)));
    }
  }, [data, chartWidth, totalChecks]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    d3.select(svgEl)
      .selectAll<SVGRectElement, ScamTrendDatum>('rect.trend-bar')
      .attr('stroke-width', (d) => (activeKey === d.key ? 2.4 : 1.8))
      .attr('opacity', (d) => (activeKey && activeKey !== d.key ? 0.5 : 1));
  }, [activeKey, data, chartWidth]);

  const activeDatum = activeKey
    ? data.find((d) => d.key === activeKey) ?? null
    : null;

  const checksLabel =
    totalChecks === 1 ? t.checksUnitSingular : t.checksUnitPlural;

  return (
    <footer className="pt-2">
      <section
        aria-labelledby="scam-trends-heading"
        className="rounded-[26px] bg-[#FFFFFF] border-2 border-[#18181B] p-6"
      >
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-[#EFEAFC] border-[1.8px] border-[#18181B] flex items-center justify-center shrink-0 mt-0.5">
            <BarChart3 className="w-5 h-5 text-[#8257E5]" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <h3
              id="scam-trends-heading"
              className="text-[21px] font-extrabold leading-[28px] text-[#18181B]"
            >
              {t.title}
            </h3>
            {totalChecks > 0 && (
              <p className="mt-1 text-[15px] sm:text-[16px] font-semibold text-[#52525B] tabular-nums">
                <span>
                  {totalChecks} {checksLabel}
                </span>
                <span aria-hidden="true"> · </span>
                <span>
                  {totalRisky} {t.flaggedRiskySuffix}
                </span>
              </p>
            )}
          </div>
        </div>

        {data.length === 0 ? (
          <p className="mt-4 text-[17px] leading-[25px] text-[#52525B]">
            {t.emptyText}
          </p>
        ) : (
          <div className="mt-4">
            <div ref={containerRef} className="w-full overflow-hidden">
              <svg
                ref={svgRef}
                role="img"
                aria-label={t.chartAriaLabel}
                className="block w-full select-none"
              />
            </div>

            <div className="mt-3 pt-3 border-t-[1.5px] border-[#18181B]/15 text-[15px] leading-[22px] text-[#52525B] font-medium tabular-nums">
              {activeDatum ? (
                <p className="text-[#18181B] font-bold">
                  {activeDatum.label}: {activeDatum.count} / {totalChecks} ({activeDatum.percentage}%)
                  {activeDatum.riskyCount > 0 &&
                    ` · ${activeDatum.riskyCount} ${t.flaggedRiskySuffix}`}
                </p>
              ) : (
                <p>{t.footerNote}</p>
              )}
            </div>
          </div>
        )}
      </section>
    </footer>
  );
}
