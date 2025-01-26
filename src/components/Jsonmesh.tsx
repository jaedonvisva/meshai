"use client"

import type React from "react"
import { useMemo, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import type { ForceGraphMethods } from "react-force-graph-2d"
import * as d3 from "d3"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

interface Person {
  _id: string
  name: string
  skills: string[]
  experience: string[]
  tags: string[]
  background: string
  school: string
}

interface JsonMeshProps {
  data: Person[]
}

const JsonMesh: React.FC<JsonMeshProps> = ({ data }) => {
  const graphRef = useRef<ForceGraphMethods>()
  const graphData = useMemo(() => {
    const nodes = data.map((person) => ({
      id: person._id,
      label: person.name,
      val: Math.sqrt(person.skills.length + person.tags.length) * 5,
    }))

    const links = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        links.push({ source: nodes[i].id, target: nodes[j].id })
      }
    }

    return { nodes, links }
  }, [data])

  useEffect(() => {
    if (graphRef.current) {
      const simulation = d3
        .forceSimulation(graphData.nodes as d3.SimulationNodeDatum[])
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("center", d3.forceCenter(0, 0))
        .force(
          "collision",
          d3.forceCollide().radius((d: any) => d.val + 10),
        )
        .force("link", d3.forceLink(graphData.links).distance(200).strength(0.1))

      graphRef.current.d3Force("charge", null)
      graphRef.current.d3Force("center", null)
      graphRef.current.d3Force("collision", null)
      graphRef.current.d3Force("link", null)

      graphRef.current.d3Force("custom", () => {
        simulation.tick()
        graphData.nodes.forEach((node: any, i) => {
          node.x = simulation.nodes()[i].x
          node.y = simulation.nodes()[i].y
        })
      })

      graphRef.current.d3ReheatSimulation()
    }
  }, [graphData])

  return (
    <div className="w-full h-[600px] bg-[#09090b] border border-gray-800 rounded-lg overflow-hidden">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel={(node: any) => node.label}
        nodeColor={() => "#FF9966"}
        linkColor={() => "#333"}
        nodeRelSize={1}
        linkWidth={0.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={() => 0.005}
        d3VelocityDecay={0.1}
        cooldownTime={15000}
        onEngineStop={() => {
          if (graphRef.current) {
            graphRef.current.zoomToFit(400, 50)
          }
        }}
      />
    </div>
  )
}

export default JsonMesh

