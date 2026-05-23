import * as d3 from 'd3'
import * as d3Sankey from 'd3-sankey'
//Solidar assets
import imgConsumo from '../../assets/consumo.svg'
import imgRed from '../../assets/red.svg'
import imgPaneles from '../../assets/paneles.svg'

import * as UTIL from '../../classes/Utiles'
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sankey-diagram

export default function SankeyFun(
  { links, svgRef },
  {
    textColor,
    colors,
    nodes,
    // an iterable of link objects (typically [{source, target}, …]
    format = ',', // a function or format specifier for values in titles
    align = 'justify', // convenience shorthand for nodeAlign
    nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeLabel, // given d in (computed) nodes, text to label the associated rect
    nodeTitle = (d) =>
      `${d.id}\n${UTIL.formatoValor('energia', d.valueReal / energyScale)}`, // given d in (computed) nodes, hover text
    nodeAlign = align, // Sankey node alignment strategy: left, right, justify, center
    nodeWidth = 120, // width of node rects
    nodePadding = 80, // vertical separation between adjacent nodes
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
      `${d.source.id} → ${d.target.id}\n${UTIL.formatoValor(
        'energia',
        d.valueReal / energyScale,
      )}`, // given d in (computed) links
    linkColor = 'source-target', // source, target, source-target, or static color
    linkStrokeOpacity = 0.5, // link stroke opacity
    linkMixBlendMode, // = 'screen', //'multiply', // link blending mode
    //colors = d3.schemeTableau10, // array of colors
    width = 540, // outer width, in pixels
    height = 400, // outer height, in pixels
    marginTop = 15, // top margin, in pixels
    marginRight = 200, // right margin, in pixels
    marginBottom = 15, // bottom margin, in pixels
    marginLeft = 200, // left margin, in pixels
    nameNodos,
    linkOrder,
    energyScale,
  } = {},
) {
  // Convert nodeAlign from a name to a function (since d3-sankey is not part of core d3).
  if (svgRef.current === null) return
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
  const LVR = d3.map(links, (d) => d.valueReal) //List de valores reales sin escalar

  if (nodes === undefined) nodes = Array.from(d3.union(LS, LT), (id) => ({ id }))

  const N = d3.map(nodes, nodeId).map(intern) //Lista de nodos
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern) //Lista de grupo

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (node, i) => ({ id: N[i] }))
  links = d3.map(links, (_, i) => ({
    source: LS[i],
    target: LT[i],
    value: LV[i],
    valueReal: LVR[i],
  }))

  // Ignore a group-based linkColor option if no groups are specified.
  if (!G && ['source', 'target', 'source-target'].includes(linkColor))
    linkColor = 'currentColor'

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

  // DESPUÉS el layout ya ha calculado node.value le aplicamos la escalaEnergia
  nodes.forEach((n) => {
    n.valueReal = n.value / energyScale
  })

  // esta es la escala para posicionar correctamente los nodos
  const graphScale = (nodes[0].y1 - nodes[0].y0) / nodes[0].value

  const perdidas = nodes.find((n) => n.id === nameNodos.perdidas)
  const diurno = nodes.find((n) => n.id === nameNodos.usoDiurno)
  const nocturno = nodes.find((n) => n.id === nameNodos.usoNocturno)
  const aRed = nodes.find((n) => n.id === nameNodos.aRed)
  const aUso = nodes.find((n) => n.id === nameNodos.usoTotal)
  const deRed = nodes.find((n) => n.id === nameNodos.deRed)

  const delta = perdidas ? perdidas.value : 0
  const verticalGap = (height - (aRed.value + aUso.value + delta) * graphScale) / 2

  aRed.y0 = perdidas ? perdidas.y1 + verticalGap : 0 //Perdidas solo existe si hay bateria, si no, el nodo de la red empieza desde 0
  aRed.y1 = aRed.y0 + aRed.value * graphScale
  aUso.y0 = aRed.y1 + verticalGap
  aUso.y1 = aUso.y0 + aUso.value * graphScale
  nocturno.y1 = aUso.y1
  nocturno.y0 = nocturno.y1 - nocturno.value * graphScale
  diurno.y1 = nocturno.y0 - verticalGap / 2
  diurno.y0 = diurno.y1 - diurno.value * graphScale

  const batpos = nodes.find((n) => n.id === nameNodos.bateria)
  const shift = (nocturno.x0 - deRed.x1) * 0.2

  if (batpos) {
    nodes.forEach((n) => {
      if (n.id.startsWith('_')) {
        n.y0 = deRed.y0
        n.y1 = deRed.y0 + n.value * graphScale
        n.x0 += shift
        n.x1 = n.x0 // o x0nuevo si quieres ancho cero
      }
    })
    batpos.x0 -= shift
    batpos.x1 -= shift

    batpos.y0 = diurno.y1 - 2 * batpos.sourceLinks[0].width
    batpos.y1 = batpos.y0 + batpos.value * graphScale
    if (batpos.y1 > deRed.y0) {
      const overlap = batpos.y1 - deRed.y0 + verticalGap / 10 // un pequeño extra para que no se toquen
      batpos.y0 -= overlap
      batpos.y1 -= overlap
    }
  }
  // deRed.y1 = aRed.y1
  // deRed.y0 = deRed.y1 - deRed.value * graphScale

  //Recalculamos todos los links a partir de las nuevas posiciones de los nodos, para evitar que se solapen los links que salen del nodo de la red. Para eso vamos a ordenar los sourceLinks del nodo de la red según el orden definido en LINK_ORDER, y luego recalculamos las posiciones y0/y1 de cada link según el nuevo orden
  nodes.forEach((nodo) => {
    let y = nodo.y0
    nodo.sourceLinks.forEach((l) => {
      l.y0 = y + l.width / 2
      y += l.width
    })

    y = nodo.y0
    nodo.targetLinks.forEach((l) => {
      l.y1 = y + l.width / 2
      y += l.width
    })
  })

  // Después de todos los ajustes de posición ajustamos los links que salen del nodo de la red para que salgan en el orden correcto y no se solapen. Para eso vamos a ordenar los sourceLinks del nodo de la red según el orden definido en LINK_ORDER, y luego recalculamos las posiciones y0/y1 de cada link según el nuevo orden

  // if (deRed) {
  //   // Los sourceLinks son los que salen de ese nodo
  //   deRed.sourceLinks.sort((a, b) => b.target.y0 - a.target.y0)

  //   // Recalcular y0/y1 de cada link según el nuevo orden
  //   let y = deRed.y0
  //   deRed.sourceLinks.forEach((l) => {
  //     l.y0 = y + l.width / 2
  //     y += l.width
  //   })
  // }
  // }

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
    .attr('height', 1200)
    .attr('viewBox', [0, 0, width, height])
    .attr('preserveAspectRatio', 'none')

    .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')

  const node = svg
    .append('g')
    .attr('stroke', nodeStroke)
    .attr('stroke-width', nodeStrokeWidth)
    .attr('stroke-opacity', nodeStrokeOpacity)
    .attr('stroke-linejoin', nodeStrokeLinejoin)
    .selectAll('rect')
    .data(nodes.filter((d) => !d.id.startsWith('_'))) //evitar el fantasma cuando hay bateria
    .join('rect')
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('width', (d) => d.x1 - d.x0)

  // Asignacion de los colores
  if (G)
    node.attr('fill', (d) => {
      const i = nodes.findIndex((n) => n.id === d.id)
      return color(G[i])
    })
  if (Tt)
    node.append('title').text((d) => {
      const i = nodes.findIndex((n) => n.id === d.id)
      return Tt[i]
    })

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

  //Vamos a asegurarnos que los links salen del nodo en el orden deseado
  nodes.forEach((node) => {
    if (node.sourceLinks?.length > 1) {
      node.sourceLinks.sort((a, b) => {
        const ia = linkOrder.indexOf(a.target.id)
        const ib = linkOrder.indexOf(b.target.id)
        return ia - ib
      })
    }
    let y = node.y0
    node.sourceLinks.forEach((l) => {
      l.y0 = y + l.width / 2
      l.dy = l.width // forzar también dy
      y += l.width
    })
  })

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

  link
    .append('text')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 30)
    .attr('fill', textColor)
    .attr('x', (d) => d.source.x1 + 5) // justo al final del nodo fuente
    .attr('y', (d) => d.y0) // posición vertical del link en el source
    .attr('dy', '0.35em')
    .attr('text-anchor', 'start')

    .text((d) =>
      !d.source.id.startsWith('_') ? `${UTIL.formatoValor('energia', d.valueReal)}` : '',
    )
  //.text((d) => (!d.source.id.startsWith('_') ? `${d.valueReal} kWh` : ''))

  if (Tl)
    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 30)
      .attr('fill', textColor)
      .selectAll('text')
      .data(nodes.filter((d) => !d.id.startsWith('_')))
      .join('text')
      .attr('x', (d) =>
        d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding,
      )
      .attr('y', (d) => (d.y1 + d.y0) / 2)
      //.attr('text-anchor', (d) => (d.x0 < width / 2 ? 'start' : 'end'))
      .attr('text-anchor', 'middle')
      .attr('transform', (d) => {
        //const x = d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding
        const x = (d.x1 + d.x0) / 2
        const y = (d.y1 + d.y0) / 2
        const angle = d.value < 250 ? 0 : -90
        return `rotate(${angle}, ${x}, ${y})`
      })
      .each(function (d, i) {
        const el = d3.select(this)
        //const x = d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding
        const x = (d.x1 + d.x0) / 2
        const lines =
          d.id != nameNodos.perdidas
            ? // ? [d.id, `${d.valueReal.toFixed(0)} kWh`]
              [d.id, `${UTIL.formatoValor('energia', d.valueReal)}`]
            : ['', d.id] // texto1 y texto2

        lines.forEach((line, j) => {
          el.append('tspan')
            .attr('x', x)
            .attr('dy', j === 0 ? '-0.7em' : '1.4em')
            .text(line)
        })
      })
  // Append images to the SVG
  const iconSize = 150

  const panelesIdx = nodes.findIndex((node) => node.id === nameNodos.paneles) //Este es el nodo de uso para dibujar el enchufe
  const deRedIdx = nodes.findIndex((node) => node.id === nameNodos.deRed) //Este es el nodo de excedentes para dibujar la torre

  svg
    .append('image')
    .attr('x', 0)
    .attr(
      'y',
      parseInt((nodes[panelesIdx].y0 + nodes[panelesIdx].y1) / 2) - iconSize / 2 + 'px',
    )
    .attr('width', iconSize)
    .attr('height', iconSize)
    .attr('href', imgPaneles)

  svg
    .append('image')
    .attr('x', 0)
    .attr(
      'y',
      parseInt((nodes[deRedIdx].y0 + nodes[deRedIdx].y1) / 2) - iconSize / 2 + 'px',
    )
    .attr('width', iconSize)
    .attr('height', iconSize)
    .attr('href', imgRed)

  const rightIcon = width - marginRight + marginLeft - iconSize
  const aUsoIdx = nodes.findIndex((node) => node.id === nameNodos.usoTotal) //Este es el nodo de uso para dibujar el enchufe
  const aRedIdx = nodes.findIndex((node) => node.id === nameNodos.aRed) //Este es el nodo de excedentes para dibujar la torre

  svg
    .append('image')
    .attr('x', rightIcon)
    .attr(
      'y',
      parseInt((nodes[aRedIdx].y0 + nodes[aRedIdx].y1) / 2) - iconSize / 2 + 'px',
    )
    .attr('width', iconSize)
    .attr('height', iconSize)
    .attr('href', imgRed)

  svg
    .append('image')
    .attr('x', rightIcon)
    .attr(
      'y',
      parseInt((nodes[aUsoIdx].y0 + nodes[aUsoIdx].y1) / 2) - iconSize / 2 + 'px',
    )
    .attr('width', iconSize)
    .attr('height', iconSize)
    .attr('href', imgConsumo)

  function intern(value) {
    return value !== null && typeof value === 'object' ? value.valueOf() : value
  }
  Object.assign(svg.node(), { scales: { color } })
}
