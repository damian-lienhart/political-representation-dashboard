<template>
  <section class="intro-section">
    <div class="intro-container">
      <h1 class="intro-title">{{ t('intro.projectTitle') }}</h1>
      <p class="intro-description">{{ t('intro.projectDescription') }}</p>


      <div class="formula-box">
        <p class="formula-title-with-info">
          {{ t('intro.formulaTitle') }}
          <span class="info-icon" tabindex="0">
            ℹ
            <span class="tooltip">
              {{ t('intro.tooltip') }}
            </span>
          </span>
        </p>

        <pre class="formula-code">
R(V, A) =
  +1, {{t('formulaValues.if')}} A(V) = S(V)  {{ t('formulaValues.plusOne') }}
   0, {{t('formulaValues.if')}} A(V) = 0     {{ t('formulaValues.zero') }}
  −1, {{t('formulaValues.if')}} A(V) ≠ S(V)  {{ t('formulaValues.minusOne') }}
</pre>

        <p class="formula-explanation">{{ t('intro.formulaExplanation') }}</p>


        <ul class="formula-values-list">
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.intro-section {
  background-color: #f9fafb;
  padding: 3rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.intro-container {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
}

.intro-title {
  font-size: 3rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 2rem;
}

.intro-description {
  font-size: 1.125rem;
  color: #4b5563;
  margin-bottom: 2.5rem;
}

.formula-box {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: left;
  font-family: monospace;
  font-size: 0.9rem;
}

.formula-title-with-info {
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.info-icon {
  display: inline-block;
  position: relative;
  cursor: help;
  font-weight: bold;
  font-size: 0.9rem;
  background: #e0e7ff;
  color: #1e3a8a;
  border-radius: 50%;
  width: 1.2em;
  height: 1.2em;
  text-align: center;
  line-height: 1.2em;
}

.tooltip {
  visibility: hidden;
  opacity: 0;
  width: 260px;
  background-color: #333;
  color: #fff;
  text-align: left;
  border-radius: 6px;
  padding: 0.7rem;
  position: absolute;
  z-index: 1;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.3s ease;
  font-size: 0.85rem;
}

.info-icon:hover .tooltip,
.info-icon:focus .tooltip {
  visibility: visible;
  opacity: 1;
}

.formula-code {
  white-space: pre-wrap;
  margin-bottom: 1rem;
}

.formula-explanation {
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
}

.formula-values-list {
  font-size: 0.85rem;
  color: #374151;
  list-style: disc;
  padding-left: 1.2rem;
  line-height: 1.6;
}
</style>
