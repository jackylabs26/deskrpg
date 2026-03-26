"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Copy } from "lucide-react";

interface TemplateSummary {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  cols: number;
  rows: number;
  createdAt: string;
}

export default function MapEditorListPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/map-templates")
      .then((r) => r.json())
      .then(async (data) => {
        const list = data.templates || [];
        setTemplates(list);

        // Generate thumbnails for each template
        const { generateMapThumbnail } = await import("@/lib/map-thumbnail");
        const thumbs: Record<string, string> = {};

        for (const t of list) {
          try {
            const res = await fetch(`/api/map-templates/${t.id}`);
            const detail = await res.json();
            const template = detail.template;
            const layers = typeof template.layers === "string" ? JSON.parse(template.layers) : template.layers;
            const objects = typeof template.objects === "string" ? JSON.parse(template.objects) : template.objects;
            thumbs[t.id] = generateMapThumbnail(layers, objects, template.cols, template.rows, 6);
          } catch {
            // Skip thumbnail on error
          }
        }
        setThumbnails(thumbs);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/map-templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/map-templates/${id}`);
    if (!res.ok) return;
    const { template } = await res.json();

    const createRes = await fetch("/api/map-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${template.name} (copy)`,
        icon: template.icon,
        description: template.description,
        cols: template.cols,
        rows: template.rows,
        layers: template.layers,
        objects: template.objects,
        spawnCol: template.spawnCol,
        spawnRow: template.spawnRow,
      }),
    });

    if (createRes.ok) {
      const { template: newTemplate } = await createRes.json();
      setTemplates((prev) => [newTemplate, ...prev]);
    }
  };

  return (
    <div className="theme-web min-h-screen bg-bg text-text p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Map Templates</h1>
          <Link
            href="/map-editor/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded font-semibold text-sm"
          >
            <Plus className="w-4 h-4" /> New Map
          </Link>
        </div>

        {loading ? (
          <div className="text-text-muted">Loading...</div>
        ) : templates.length === 0 ? (
          <div className="text-text-muted text-center py-12">
            No map templates yet. Create your first one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div
                key={t.id}
                className="bg-surface border border-border rounded-lg p-4 hover:border-primary-light transition"
              >
                {thumbnails[t.id] && (
                  <img src={thumbnails[t.id]} alt={t.name}
                    className="w-full rounded mb-2 border border-border"
                    style={{ imageRendering: "pixelated" }} />
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xl mr-2">{t.icon}</span>
                    <span className="font-semibold">{t.name}</span>
                  </div>
                  <span className="text-xs text-text-dim">
                    {t.cols}x{t.rows}
                  </span>
                </div>
                {t.description && (
                  <p className="text-sm text-text-muted mb-3">
                    {t.description}
                  </p>
                )}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => router.push(`/map-editor/${t.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs bg-surface-raised border border-border hover:border-primary-light"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(t.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs bg-surface-raised border border-border hover:border-primary-light"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs bg-surface-raised border border-border hover:border-danger text-danger"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
