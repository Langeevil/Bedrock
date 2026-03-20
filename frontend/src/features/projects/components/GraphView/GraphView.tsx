import { useRef, useEffect, useCallback, useState } from "react";
import type { Task, Tag, GraphNode, GraphData, Camera, TooltipData } from "../types";
import { buildGraph, renderGraph, hitTest } from "../utils/graphUtils";

interface Props {
  tasks: Task[];
  tags: Tag[];
  onTaskClick: (id: string) => void;
}

const LEGEND: [string, string][] = [
  ["#1a1a18", "Projeto"],
  ["#4a6fa5", "Tarefa"],
  ["#2d8a5e", "Tag"],
];

const NODE_TYPE_LABEL: Record<GraphNode["type"], string> = {
  project: "Projeto",
  task: "Tarefa",
  tag: "Tag",
};

export function GraphView({ tasks, tags, onTaskClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const camRef    = useRef<Camera>({ ox: 0, oy: 0, scale: 1, drag: false, lx: 0, ly: 0 });
  const graphRef  = useRef<GraphData>({ nodes: [], edges: [] });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { nodes, edges } = graphRef.current;
    renderGraph(ctx, canvas.width, canvas.height, nodes, edges, camRef.current);
  }, []);

  const rebuild = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    graphRef.current = buildGraph(tasks, tags, W, H);
    redraw();
  }, [tasks, tags, redraw]);

  useEffect(() => { rebuild(); }, [rebuild]);

  useEffect(() => {
    const ro = new ResizeObserver(rebuild);
    const parent = canvasRef.current?.parentElement;
    if (parent) ro.observe(parent);
    return () => ro.disconnect();
  }, [rebuild]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cam = camRef.current;
    if (cam.drag) {
      cam.ox += e.clientX - cam.lx; cam.oy += e.clientY - cam.ly;
      cam.lx = e.clientX; cam.ly = e.clientY;
      redraw(); return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hit = hitTest(graphRef.current.nodes, e, canvas, cam);
    if (hit) {
      const rect = canvas.getBoundingClientRect();
      const taskObj = hit.type === "task" ? tasks.find(t => t.id === hit.taskId) : undefined;
      setTooltip({
        x: e.clientX - rect.left + 14,
        y: e.clientY - rect.top  - 14,
        node: hit,
        taskTags: taskObj
          ? taskObj.tags.map(id => tags.find(t => t.id === id)).filter((t): t is Tag => Boolean(t))
          : [],
      });
    } else setTooltip(null);
  }, [tasks, tags, redraw]);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const cam = camRef.current;
    cam.scale = Math.max(0.25, Math.min(3, cam.scale * (e.deltaY < 0 ? 1.1 : 0.9)));
    redraw();
  }, [redraw]);

  // Passive-false wheel listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const onClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hit = hitTest(graphRef.current.nodes, e, canvas, camRef.current);
    if (hit?.type === "task" && hit.taskId) onTaskClick(hit.taskId);
  }, [onTaskClick]);

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#f4f3ef" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", cursor: "grab" }}
        onMouseDown={e => {
          camRef.current.drag = true;
          camRef.current.lx = e.clientX;
          camRef.current.ly = e.clientY;
        }}
        onMouseUp={()    => { camRef.current.drag = false; }}
        onMouseLeave={()  => { camRef.current.drag = false; setTooltip(null); }}
        onMouseMove={onMouseMove}
        onClick={onClick}
      />

      {/* Legend */}
      <div style={{
        position: "absolute", top: 14, left: 14,
        background: "#fff", border: "0.5px solid #e2e0d8",
        borderRadius: 8, padding: "9px 13px",
      }}>
        {LEGEND.map(([c, l], i) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: i < LEGEND.length - 1 ? 5 : 0 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
            <span style={{ fontSize: 11, color: "#6b6960" }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div style={{
        position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
        fontSize: 11, color: "#9c9a8e", fontFamily: "monospace",
        background: "#fff", padding: "5px 13px", borderRadius: 20,
        border: "0.5px solid #e2e0d8", pointerEvents: "none", whiteSpace: "nowrap",
      }}>
        arraste · scroll p/ zoom · clique na tarefa
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y,
          background: "#fff", border: "0.5px solid #ccc9bf",
          borderRadius: 8, padding: "9px 13px",
          pointerEvents: "none", zIndex: 50,
          boxShadow: "0 4px 16px rgba(0,0,0,.07)", minWidth: 130,
        }}>
          <div style={{ fontSize: 10, color: "#9c9a8e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3, fontFamily: "monospace" }}>
            {NODE_TYPE_LABEL[tooltip.node.type]}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18", marginBottom: tooltip.taskTags.length > 0 ? 5 : 0 }}>
            {tooltip.node.label}
          </div>
          {tooltip.taskTags.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {tooltip.taskTags.map(tg => (
                <span key={tg.id} style={{ padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 500, background: tg.color + "22", color: tg.color }}>
                  {tg.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}