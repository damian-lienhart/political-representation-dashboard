<template>
  <div class="home-layout">
    <!-- Language Switcher -->
    <div class="language-switcher">
      🌐
      <select v-model="locale">
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
        <option value="it">Italiano</option>
        <option value="en">English</option>

      </select>
    </div>
    <ProjectIntro />
    <!-- Row 1: Diagramm 1 + 2 -->
    <section class="full">
      <EmpfehlungenVolkChart :language="locale" />
    </section>

    <section class="full">
      <ParteiRepräsentationChart />
    </section>

    <!-- Row 2: Diagramm 3 + 4 -->
    <section class="full">
      <PoliticalInstitutionsVolk />
    </section>

    <section class="full">
      <KantonaleRepräsentationChart />
    </section>
  </div>

  <PartyGlossary />

  <div id="app">
    <Footer />
  </div>
</template>




<script setup>
import { useI18n } from 'vue-i18n'
import EmpfehlungenVolkChart from '@/components/D1_StackedBarChart/EmpfehlungenVolkChart.vue'
import ParteiRepräsentationChart from '@/components/D2_LineChart/ParteiRepräsentationChart.vue'
import PoliticalInstitutionsVolk from '@/components/D3_HeatMap/PoliticalInstitutionsVolk.vue'
import KantonaleRepräsentationChart from '@/components/D4_ChoroplethMap/KantonaleRepräsentationChart.vue'
import PartyGlossary from '@/components/PartyGlossary.vue'
import Footer from "@/components/Footer.vue";
import ProjectIntro from "@/components/ProjectIntro.vue";

const { locale, t } = useI18n()
</script>


<style scoped>
.home-layout {
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  background-color: #f8f9fb;
}

.language-switcher {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.language-switcher select {
  margin-left: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 0.9rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  width: 100%;
  margin-bottom: 2rem;
}

.half, .full {
  background: white;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: box-shadow 0.2s ease-in-out;
}

.half:hover, .full:hover {
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
}

.half {
  flex: 1 1 calc(50% - 1rem);
}

.full {
  flex: 1 1 100%;
}

.placeholder {
  background-color: #f1f5f9;
  padding: 2rem;
  text-align: center;
  font-style: italic;
  color: #64748b;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

/* ✅ Responsive layout rules */
@media (max-width: 1024px) {
  .half {
    flex: 1 1 100% !important;
  }

  .home-layout {
    padding: 1rem;
  }
}

@media (max-width: 600px) {
  .placeholder {
    font-size: 0.9rem;
    padding: 1.5rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  .language-switcher {
    justify-content: center;
  }
}
*, *::before, *::after {
  box-sizing: border-box;
}


</style>
