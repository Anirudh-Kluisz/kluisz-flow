import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';

export interface GraphSpec {
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    config: Record<string, any>;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
  }>;
  inputsNeeded: string[];
}

export interface StudioState {
  // Graph state
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  
  // Execution state
  isRunning: boolean;
  runStatus: Record<string, 'idle' | 'running' | 'success' | 'failed'>;
  
  // UI state
  sidebarCollapsed: boolean;
  inspectorTab: 'config' | 'io' | 'logs';
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setIsRunning: (running: boolean) => void;
  setRunStatus: (nodeId: string, status: StudioState['runStatus'][string]) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setInspectorTab: (tab: StudioState['inspectorTab']) => void;
  loadGraphSpec: (spec: GraphSpec) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNode: null,
  isRunning: false,
  runStatus: {},
  sidebarCollapsed: false,
  inspectorTab: 'config',
  
  // Actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  setIsRunning: (running) => set({ isRunning: running }),
  setRunStatus: (nodeId, status) => 
    set((state) => ({
      runStatus: { ...state.runStatus, [nodeId]: status }
    })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  
  loadGraphSpec: (spec) => {
    const nodes: Node[] = spec.nodes.map((node, index) => ({
      id: node.id,
      type: node.type === 'DataIngest' ? 'dataIngest' : 'aiAgent',
      position: { x: 100 + (index % 3) * 300, y: 100 + Math.floor(index / 3) * 200 },
      data: {
        label: node.label,
        type: node.type,
        config: node.config,
      },
    }));
    
    const edges: Edge[] = spec.edges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
    }));
    
    set({ nodes, edges, runStatus: {} });
  },
}));