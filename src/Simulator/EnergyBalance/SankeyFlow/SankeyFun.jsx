import * as d3 from 'd3'
import * as d3Sankey from 'd3-sankey'
import * as UTIL from '../../classes/Utiles'
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sankey-diagram
export default function SankeyFun(
  { links, svgRef },
  {
    nodes,
    // an iterable of link objects (typically [{source, target}, …]
    format = ',', // a function or format specifier for values in titles
    align = 'justify', // convenience shorthand for nodeAlign
    nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeLabel, // given d in (computed) nodes, text to label the associated rect
    nodeTitle = (d) => `${d.id}\n${UTIL.formatoValor('energia', d.value)}`, // given d in (computed) nodes, hover text
    nodeAlign = align, // Sankey node alignment strategy: left, right, justify, center
    nodeWidth = 60, // width of node rects
    nodePadding = 100, // vertical separation between adjacent nodes
    nodeLabelPadding = 6, // horizontal separation between node and label
    nodeStroke = 'currentColor', // stroke around node rects
    nodeStrokeWidth, // width of stroke around node rects, in pixels
    nodeStrokeOpacity, // opacity of stroke around node rects
    nodeStrokeLinejoin, // line join for stroke around node rects
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkValue = ({ value }) => value, // given d in links, returns the quantitative value
    linkPath = d3Sankey.sankeyLinkHorizontal(), // given d in (computed) links, returns the SVG path
    linkTitle = (d) =>
      `${d.source.id} → ${d.target.id}\n${UTIL.formatoValor('energia', d.value)}`, // given d in (computed) links
    linkColor = 'source-target', // source, target, source-target, or static color
    linkStrokeOpacity = 0.5, // link stroke opacity
    linkMixBlendMode = 'multiply', // link blending mode
    colors = d3.schemeTableau10, // array of colors
    width = 540, // outer width, in pixels
    height = 400, // outer height, in pixels
    marginTop = 15, // top margin, in pixels
    marginRight = 10, // right margin, in pixels
    marginBottom = 15, // bottom margin, in pixels
    marginLeft = 10, // left margin, in pixels
  } = {},
) {
  // Convert nodeAlign from a name to a function (since d3-sankey is not part of core d3).
  if (typeof nodeAlign !== 'function')
    nodeAlign =
      {
        left: d3Sankey.sankeyLeft,
        right: d3Sankey.sankeyRight,
        center: d3Sankey.sankeyCenter,
      }[nodeAlign] ?? d3Sankey.sankeyJustify

  // Compute values.
  const LS = d3.map(links, linkSource).map(intern) //Lista de fuentes
  const LT = d3.map(links, linkTarget).map(intern) //Lista de destinos
  const LV = d3.map(links, linkValue) //List de valores

  if (nodes === undefined) nodes = Array.from(d3.union(LS, LT), (id) => ({ id }))
  const N = d3.map(nodes, nodeId).map(intern) //Lista de nodos
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern) //Lista de grupo

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (_, i) => ({ id: N[i] }))
  links = d3.map(links, (_, i) => ({
    source: LS[i],
    target: LT[i],
    value: LV[i],
  }))

  // Ignore a group-based linkColor option if no groups are specified.
  if (!G && ['source', 'target', 'source-target'].includes(linkColor))
    linkColor = 'currentColor'

  colors = [
    '#59A14F', //Producción paneles
    '#B6722F', //Consumo de red
    '#e15759', //Excedente
    '#FFFF66', //Cosumo diurno
    '#A0A0A0', //Consumo nocturno
    '#FF99CC', //Consumo total
    '#af7aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ab',
  ]

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = G
  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors)

  // Compute the Sankey layout.
  d3Sankey
    .sankey()
    .nodeId(({ index: i }) => N[i])
    .nodeAlign(nodeAlign)
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .extent([
      [marginLeft, marginTop],
      [width - marginRight, height - marginBottom],
    ])({ nodes, links })

  // Compute titles and labels using layout nodes, so as to access aggregate values.
  if (typeof format !== 'function') format = d3.format(format)

  const Tl =
    nodeLabel === undefined ? N : nodeLabel == null ? null : d3.map(nodes, nodeLabel)
  const Tt = nodeTitle == null ? null : d3.map(nodes, nodeTitle)
  const Lt = linkTitle == null ? null : d3.map(links, linkTitle)

  // A unique identifier for clip paths (to avoid conflicts).
  const uid = `O-${Math.random().toString(16).slice(2)}`

  const svg = d3.select(svgRef.current)

  svg.selectAll('*').remove()

  svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')

  const node = svg
    .append('g')
    .attr('stroke', nodeStroke)
    .attr('stroke-width', nodeStrokeWidth)
    .attr('stroke-opacity', nodeStrokeOpacity)
    .attr('stroke-linejoin', nodeStrokeLinejoin)
    .selectAll('rect')
    .data(nodes)
    .join('rect')
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('width', (d) => d.x1 - d.x0)

  if (G) node.attr('fill', ({ index: i }) => color(G[i]))
  if (Tt) node.append('title').text(({ index: i }) => Tt[i])

  const link = svg
    .append('g')
    .attr('fill', 'none')
    .attr('stroke-opacity', linkStrokeOpacity)
    .selectAll('g')
    .data(links)
    .join('g')
    .style('mix-blend-mode', linkMixBlendMode)

  if (linkColor === 'source-target')
    link
      .append('linearGradient')
      .attr('id', (d) => `${uid}-link-${d.index}`)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', (d) => d.source.x1)
      .attr('x2', (d) => d.target.x0)
      .call((gradient) =>
        gradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', ({ source: { index: i } }) => color(G[i])),
      )
      .call((gradient) =>
        gradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', ({ target: { index: i } }) => color(G[i])),
      )

  link
    .append('path')
    .attr('d', linkPath)
    .attr(
      'stroke',
      linkColor === 'source-target'
        ? ({ index: i }) => `url(#${uid}-link-${i})`
        : linkColor === 'source'
        ? ({ source: { index: i } }) => color(G[i])
        : linkColor === 'target'
        ? ({ target: { index: i } }) => color(G[i])
        : linkColor,
    )
    .attr('stroke-width', ({ width }) => Math.max(1, width))
    .call(Lt ? (path) => path.append('title').text(({ index: i }) => Lt[i]) : () => {})

  if (Tl)
    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 30)
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', (d) =>
        d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding,
      )
      .attr('y', (d) => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => (d.x0 < width / 2 ? 'start' : 'end'))
      .text(({ index: i }) => Tt[i])

  function intern(value) {
    return value !== null && typeof value === 'object' ? value.valueOf() : value
  }
  Object.assign(svg.node(), { scales: { color } })
}
