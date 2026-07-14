'use client';
import { Scene } from '@/types';
import { Code, Box, GitBranch, Layers, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SceneComposer } from '@/services/composition/core/SceneComposer';

interface NodeData {
  id: string;
  type: string;
  name: string;
  children: NodeData[];
}

export function RenderTreeViewer({ scene }: { scene?: Scene }) {
  const [treeData, setTreeData] = useState<NodeData | null>(null);
  
  useEffect(() => {
    if (!scene || !scene.composition) {
      setTreeData(null);
      return;
    }
    
    // We instantiate a throw-away composer just to get the initial tree structure
    // In a real app, this would read from the live composer via Context/Zustand
    const composer = new SceneComposer(0);
    const { root } = composer.compose(scene.id, scene.composition);
    
    // Filter out bones for cleaner UI (too many to show) unless we want them
    const cleanTree = (node: any): any => {
      return {
        id: node.id,
        name: node.name,
        type: node.type,
        children: node.children
          .filter((c: any) => c.type !== 'bone' || c.children.length > 0) // Hide leaf bones
          .map(cleanTree)
      };
    };
    
    setTreeData(cleanTree(root));
  }, [scene]);

  if (!scene || !scene.composition) {
    return (
      <div className="w-80 border-l border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center justify-center text-center">
        <GitBranch className="h-8 w-8 text-zinc-600 mb-4" />
        <h3 className="text-zinc-400 font-medium">No Render Tree</h3>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full text-sm">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-violet-400" /> Render Tree
        </h2>
        <button 
          onClick={() => {
            if(scene && scene.composition) {
              const composer = new SceneComposer(0);
              const { root } = composer.compose(scene.id, scene.composition);
              const json = JSON.stringify(root.toJSON(), null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `scene_${scene.id}_graph.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded"
        >
          <Code className="h-3 w-3" /> Export JSON
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {treeData && <TreeNode node={treeData} level={0} />}
      </div>
    </div>
  );
}

function TreeNode({ node, level }: { node: NodeData, level: number }) {
  const [expanded, setExpanded] = useState(level < 2); // Expand top levels by default
  const hasChildren = node.children && node.children.length > 0;
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'root': return <Layers className="h-3.5 w-3.5 text-zinc-500" />;
      case 'character': return <Box className="h-3.5 w-3.5 text-blue-400" />;
      case 'bone': return <GitBranch className="h-3.5 w-3.5 text-violet-400" />;
      case 'prop': return <Box className="h-3.5 w-3.5 text-green-400" />;
      default: return <Box className="h-3.5 w-3.5 text-zinc-500" />;
    }
  };

  return (
    <div className="font-mono text-xs">
      <div 
        className="flex items-center gap-1.5 py-1.5 px-1 hover:bg-zinc-900/50 rounded cursor-pointer group"
        style={{ paddingLeft: `${level * 12}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren && (
            expanded ? <ChevronDown className="h-3 w-3 text-zinc-500" /> : <ChevronRight className="h-3 w-3 text-zinc-500" />
          )}
        </div>
        {getIcon(node.type)}
        <span className="text-zinc-300 truncate">{node.name}</span>
        <span className="text-zinc-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          {node.type}
        </span>
      </div>
      
      {expanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
