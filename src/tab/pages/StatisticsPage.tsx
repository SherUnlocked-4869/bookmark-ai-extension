import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Card, CardContent, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useStats, type CategoryStat, type Stats } from '@/tab/hooks/useStats';
import { storageService } from '@/tab/services/storageService';

type SortMode = 'desc' | 'asc' | 'alpha';

function OverviewCard({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <Card sx={{ flex: '1 1 160px', minWidth: 0 }}>
      <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const { loaded, computeStats } = useStats();
  const [sort, setSort] = useState<SortMode>('desc');
  const [dedupReport, setDedupReport] = useState<{ duplicateGroups: number; duplicateCount: number } | null>(null);

  useEffect(() => {
    storageService.getDedupReport().then(setDedupReport);
  }, []);

  const stats: Stats = useMemo(() => loaded ? computeStats() : {
    totalBookmarks: 0, categoryCount: 0, unclassifiedCount: 0,
    duplicateCount: 0, categoryDistribution: [],
  }, [loaded, computeStats]);

  const sortedDistribution = useMemo(() => {
    const dist = [...stats.categoryDistribution];
    switch (sort) {
      case 'desc': return dist.sort((a, b) => b.count - a.count);
      case 'asc': return dist.sort((a, b) => a.count - b.count);
      case 'alpha': return dist.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    }
  }, [stats.categoryDistribution, sort]);

  const maxCount = sortedDistribution.length > 0 ? Math.max(...sortedDistribution.map((s) => s.count)) : 1;
  const avgCount = stats.categoryCount > 0 ? Math.round(stats.totalBookmarks / stats.categoryCount) : 0;
  const minCat = sortedDistribution.length > 0 ? sortedDistribution[sortedDistribution.length - 1] : null;
  const maxCat = sortedDistribution.length > 0 ? sortedDistribution[0] : null;

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1, px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', alignItems: 'center' }}>
        <BarChartIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>统计看板</Typography>
      </Box>

      {!loaded ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body2" color="text.secondary">加载中...</Typography>
        </Box>
      ) : stats.totalBookmarks === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BarChartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无数据
          </Typography>
          <Typography variant="body2" color="text.disabled">
            请在书签管理页同步并分类书签
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 3 }}>
          {/* Overview cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <OverviewCard value={stats.totalBookmarks} label="书签总数" color="#1976D2" />
            <OverviewCard value={stats.categoryCount} label="分类数" color="#388E3C" />
            <OverviewCard value={stats.unclassifiedCount} label="未分类" color="#FF6F00" />
            <OverviewCard value={stats.duplicateCount} label="重复书签" color="#D32F2F" />
          </Box>

          {/* Bar chart */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  分类分布
                </Typography>
                <ToggleButtonGroup
                  value={sort}
                  exclusive
                  onChange={(_, v) => v && setSort(v as SortMode)}
                  size="small"
                >
                  <ToggleButton value="desc">最多</ToggleButton>
                  <ToggleButton value="asc">最少</ToggleButton>
                  <ToggleButton value="alpha">字母</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {sortedDistribution.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  暂无分类数据
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {sortedDistribution.map((s) => (
                    <Box key={s.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>{s.name}</Typography>
                        <Typography variant="body2" fontWeight={600}>{s.count}</Typography>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: `${(s.count / maxCount) * 100}%`,
                            bgcolor: 'primary.main',
                            borderRadius: 4,
                            transition: 'width 0.3s',
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Summary footer */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            {maxCat && <Chip label={`最大: ${maxCat.name} (${maxCat.count})`} size="small" variant="outlined" />}
            {minCat && <Chip label={`最小: ${minCat.name} (${minCat.count})`} size="small" variant="outlined" />}
            <Chip label={`平均: ${avgCount}/分类`} size="small" variant="outlined" />
            {dedupReport && dedupReport.duplicateGroups > 0 && (
              <Chip label={`重复组: ${dedupReport.duplicateGroups}`} size="small" variant="outlined" color="warning" />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
