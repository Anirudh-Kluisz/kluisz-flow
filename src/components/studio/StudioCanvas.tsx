import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStudioStore } from '@/stores/studioStore';
import { AIAgentNode } from './nodes/AIAgentNode';

// Define custom node types
const nodeTypes = {
  aiAgent: AIAgentNode,
};

export const StudioCanvas = () => {
  const { nodes, edges, setNodes, setEdges, setSelectedNode } = useStudioStore();
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);

  // Sync store with local state
  React.useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes, setLocalNodes]);

  React.useEffect(() => {
    setLocalEdges(edges);
  }, [edges, setLocalEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--brand-primary))',
        },
        style: {
          stroke: 'hsl(var(--brand-primary))',
          strokeWidth: 2,
        },
      };
      const updatedEdges = addEdge(newEdge, localEdges);
      setLocalEdges(updatedEdges);
      setEdges(updatedEdges);
    },
    [localEdges, setLocalEdges, setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--brand-primary))',
          },
          style: {
            stroke: 'hsl(var(--brand-primary))',
            strokeWidth: 2,
          },
        }}
      >
        <Background 
          color="hsl(var(--brand-border))" 
          gap={20} 
          size={1}
          className="opacity-30"
        />
        <Controls 
          className="bg-brand-surface border-brand-border shadow-card"
          showInteractive={false}
        />
        <MiniMap 
          className="bg-brand-surface border border-brand-border rounded-lg shadow-card"
          nodeColor="hsl(var(--brand-primary))"
          maskColor="hsl(var(--brand-bg) / 0.8)"
        />
      </ReactFlow>
    </div>
  );
};