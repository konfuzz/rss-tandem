<script setup lang="ts">
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Message from 'primevue/message';
import TabMenu from 'primevue/tabmenu';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';

import { useAuthStore } from '../stores/auth';
import { apiFetch } from '../utils/api';

interface AverageLeaderItem {
  score: number;
  username: string;
}

interface FinishedLeaderItem {
  username: string;
  value: number;
}

type LeaderboardMetric = 'avgScore' | 'finished' | 'maxStreak';

interface LeaderboardTableRow {
  isCurrentUser: boolean;
  rank: number;
  rowKey: string;
  username: string;
  value: string;
}

interface LeadersResponse {
  avgScore: AverageLeaderItem[];
  finished: FinishedLeaderItem[];
  maxStreak: StreakLeaderItem[];
}

interface MetricTab {
  key: LeaderboardMetric;
  label: string;
}

interface StreakLeaderItem {
  streak: number;
  username: string;
}

interface TabChangeEvent {
  index: number;
}

const auth = useAuthStore();
const activeMetric = ref<LeaderboardMetric>('maxStreak');
const isLoading = ref(false);
const loadError = ref('');
const leaders = ref<LeadersResponse>({
  avgScore: [],
  finished: [],
  maxStreak: [],
});

const emptyTableMessage = 'Лидерборд пока пуст';
const metricTabs: MetricTab[] = [
  { key: 'maxStreak', label: 'Стрик' },
  { key: 'finished', label: 'Квизы' },
  { key: 'avgScore', label: 'Ср. балл' },
];

const tabMenuPt = {
  item: { class: 'flex-1 basis-0' },
  itemLink: { class: 'justify-center text-xs whitespace-nowrap' },
};

const dataTablePt = {
  tableContainer: { class: 'rounded-xl sm:rounded-2xl' },
};

const activeTabLabel = computed(() => metricTabs.find((tab) => tab.key === activeMetric.value)?.label ?? 'Стрик');

const activeTabIndex = computed(() =>
  Math.max(
    metricTabs.findIndex((tab) => tab.key === activeMetric.value),
    0,
  ),
);
const currentUserName = computed(() => auth.userName ?? '');
const tableRows = computed<LeaderboardTableRow[]>(() => {
  const rows = getRowsForMetric(activeMetric.value);

  return rows.map((row, index) => ({
    isCurrentUser: row.username === currentUserName.value,
    rank: index + 1,
    rowKey: `${activeMetric.value}-${row.username}-${index + 1}`,
    username: row.username,
    value: formatMetricValue(activeMetric.value, row.value),
  }));
});
const isCurrentUserInTop = computed(() => tableRows.value.some((row) => row.isCurrentUser));
const showEncouragement = computed(
  () =>
    !isLoading.value &&
    !loadError.value &&
    !!currentUserName.value &&
    tableRows.value.length > 0 &&
    !isCurrentUserInTop.value,
);
const encouragementText = computed(() => {
  if (activeMetric.value === 'maxStreak') {
    return 'Твой стрик уже растет. Еще несколько сильных дней подряд, и топ-10 станет заметно ближе.';
  }

  if (activeMetric.value === 'finished') {
    return 'Каждый завершенный квиз двигает тебя вверх. Продолжай в том же темпе, и ты быстро ворвешься в десятку.';
  }

  return 'Точность уже работает на тебя. Пара уверенных результатов, и твое имя появится в топ-10.';
});

onMounted(() => {
  void loadLeaders();
});

function formatMetricValue(metric: LeaderboardMetric, value: number): string {
  if (metric === 'avgScore' && !Number.isInteger(value)) {
    return value.toFixed(1);
  }

  return value.toString();
}

function getRowsForMetric(metric: LeaderboardMetric): Array<{ username: string; value: number }> {
  if (metric === 'avgScore') {
    return leaders.value.avgScore.map((entry) => ({
      username: entry.username,
      value: entry.score,
    }));
  }

  if (metric === 'finished') {
    return leaders.value.finished.map((entry) => ({
      username: entry.username,
      value: entry.value,
    }));
  }

  return leaders.value.maxStreak.map((entry) => ({
    username: entry.username,
    value: entry.streak,
  }));
}

function handleTabChange(event: TabChangeEvent) {
  const nextTab = metricTabs[event.index];

  if (!nextTab) {
    return;
  }

  activeMetric.value = nextTab.key;
}

function isAverageLeaderItem(value: unknown): value is AverageLeaderItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AverageLeaderItem>;

  return (
    typeof candidate.score === 'number' && Number.isFinite(candidate.score) && typeof candidate.username === 'string'
  );
}

function isFinishedLeaderItem(value: unknown): value is FinishedLeaderItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<FinishedLeaderItem>;

  return (
    typeof candidate.value === 'number' && Number.isFinite(candidate.value) && typeof candidate.username === 'string'
  );
}

function isStreakLeaderItem(value: unknown): value is StreakLeaderItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<StreakLeaderItem>;

  return (
    typeof candidate.streak === 'number' && Number.isFinite(candidate.streak) && typeof candidate.username === 'string'
  );
}

async function loadLeaders() {
  isLoading.value = true;
  loadError.value = '';

  try {
    const response = await apiFetch('/leaders');

    if (!response.ok) {
      throw new Error(`Failed to load leaders: ${response.status}`);
    }

    const payload = (await response.json()) as Partial<Record<LeaderboardMetric, unknown>>;

    leaders.value = {
      avgScore: Array.isArray(payload.avgScore) ? payload.avgScore.filter(isAverageLeaderItem) : [],
      finished: Array.isArray(payload.finished) ? payload.finished.filter(isFinishedLeaderItem) : [],
      maxStreak: Array.isArray(payload.maxStreak) ? payload.maxStreak.filter(isStreakLeaderItem) : [],
    };
  } catch (error) {
    console.error('Ошибка загрузки лидерборда:', error);
    leaders.value = {
      avgScore: [],
      finished: [],
      maxStreak: [],
    };
    loadError.value = 'Не удалось загрузить лидерборд';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 sm:py-10 dark:bg-zinc-950">
    <div class="mx-auto w-full max-w-6xl">
      <Card>
        <template #title>
          <h1
            class="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl dark:text-white"
          >
            Лидерборд
          </h1>
        </template>

        <template #content>
          <div class="flex flex-col gap-5 sm:gap-6">
            <TabMenu :model="metricTabs" :activeIndex="activeTabIndex" :pt="tabMenuPt" @tab-change="handleTabChange" />

            <DataTable
              :value="tableRows"
              dataKey="rowKey"
              :pt="dataTablePt"
              :loading="isLoading"
              scrollable
              tableStyle="min-width: 22rem; table-layout: fixed;"
              class="rounded-xl border border-zinc-200 sm:rounded-2xl dark:border-zinc-800"
              stripedRows
            >
              <template #empty>
                <div class="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {{ loadError || emptyTableMessage }}
                </div>
              </template>

              <Column field="rank" header="Место" :style="{ width: '4.75rem' }">
                <template #body="{ data }">
                  <span class="text-base font-bold text-zinc-900 sm:text-lg dark:text-white">#{{ data.rank }}</span>
                </template>
              </Column>

              <Column field="username" header="Участник">
                <template #body="{ data }">
                  <div class="flex min-w-0 items-center gap-2">
                    <span class="font-semibold break-all text-zinc-900 dark:text-white">{{ data.username }}</span>
                    <Tag
                      v-if="data.isCurrentUser"
                      value="Ты"
                      severity="success"
                      class="border! border-emerald-200! bg-emerald-100! text-xs! font-semibold! text-emerald-700! dark:border-emerald-500/20! dark:bg-emerald-500/15! dark:text-emerald-300!"
                    />
                  </div>
                </template>
              </Column>

              <Column field="value" :header="activeTabLabel" :style="{ width: '7.5rem' }">
                <template #body="{ data }">
                  <span class="text-sm font-bold text-zinc-900 sm:text-base dark:text-white">
                    {{ data.value }}
                  </span>
                </template>
              </Column>
            </DataTable>

            <Message v-if="showEncouragement" severity="warn" :closable="false" class="rounded-3xl">
              <div class="flex flex-col gap-1">
                <p class="text-sm font-semibold sm:text-base">Тебя пока нет в этом топе, но это временно.</p>
                <p class="text-sm sm:text-base">
                  {{ encouragementText }}
                </p>
              </div>
            </Message>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
