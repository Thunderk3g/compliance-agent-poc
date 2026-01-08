import { Info } from "lucide-react";
import { dashboardColors, getStatusColor } from "../../lib/dashboardColors";

interface ScoreSidebarProps {
  overallScore: number;
  irdaiScore: number;
  brandScore: number;
  seoScore: number;
  grade: string;
}

export function ScoreSidebar({
  overallScore,
  irdaiScore,
  brandScore,
  seoScore,
  grade,
}: ScoreSidebarProps) {
  return (
    <div className="space-y-6 relative">
      {/* Scattered decorative shapes - various positions */}
      <div className="absolute -left-1 top-12 w-4 h-4 rounded-full border border-muted-foreground/5 opacity-40" />
      <div className="absolute right-4 top-24 w-6 h-6 rotate-45 border border-muted-foreground/5 opacity-30" />
      <div className="absolute left-2 top-40 w-5 h-5 rounded border border-muted-foreground/5 opacity-35" />
      <div className="absolute -right-2 top-56 w-7 h-7 rounded-full border border-muted-foreground/5 opacity-25" />
      <div className="absolute left-4 top-72 w-4 h-4 rotate-12 border border-muted-foreground/5 opacity-40">
        <div className="w-full h-full border-t border-muted-foreground/10 rotate-45" />
      </div>
      <div className="absolute right-1 top-96 w-5 h-5 rounded-full border border-muted-foreground/5 opacity-30" />
      <div className="absolute -left-2 bottom-32 w-6 h-6 rounded border border-muted-foreground/5 opacity-35" />
      <div className="absolute right-3 bottom-16 w-4 h-4 rotate-45 border border-muted-foreground/5 opacity-40" />
      <div className="absolute left-1 bottom-8 w-5 h-5 rounded-full border border-muted-foreground/5 opacity-25" />

      {/* Overall Score - Prominent */}
      <div className="space-y-2 relative">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Overall
        </div>
        <div
          className="text-5xl font-bold"
          style={{ color: getStatusColor(overallScore) }}
        >
          {overallScore.toFixed(1)}
        </div>
        <div className="text-sm text-muted-foreground">Weighted average</div>
        <div className="inline-block px-2 py-1 text-xs font-bold rounded bg-muted">
          Grade {grade}
        </div>
      </div>

      {/* Separator */}
      <div className="w-3/4 h-px bg-border" />

      {/* IRDAI Score */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: dashboardColors.irdai.light }}
          />
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            IRDAI
          </div>
        </div>
        <div
          className="text-3xl font-bold"
          style={{ color: getStatusColor(irdaiScore) }}
        >
          {irdaiScore.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground">Critical compliance</div>
      </div>

      {/* Brand Score */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: dashboardColors.brand.light }}
          />
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Brand
          </div>
        </div>
        <div
          className="text-3xl font-bold"
          style={{ color: getStatusColor(brandScore) }}
        >
          {brandScore.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground">
          Guidelines adherence
        </div>
      </div>

      {/* SEO Score */}
      <div className="space-y-2 relative">
        <div className="absolute -right-2 top-2 w-6 h-6 rotate-12 border border-cyan-500/10 opacity-50">
          <div className="w-full h-full border-t-2 border-cyan-500/20 rotate-45" />
        </div>
        <div className="absolute -right-4 bottom-2 w-7 h-7 rounded-full border border-cyan-500/10 opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: dashboardColors.seo.light }}
            />
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              SEO
            </div>
          </div>
          <div
            className="text-3xl font-bold"
            style={{ color: getStatusColor(seoScore) }}
          >
            {seoScore.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">
            Optimization score
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="w-3/4 h-px bg-border" />

      {/* Score Calculation Info */}
      <div className="space-y-2 pt-4 relative">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium text-foreground mb-1">
              Score Calculation
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Overall score is weighted: IRDAI (50%), Brand (30%), SEO (20%).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
