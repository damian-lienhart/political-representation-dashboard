<template>
  <footer class="footer">
    <div class="footer-wrapper">
      <img
          src="/logo-bfh.svg"
          alt="Berner Fachhochschule"
          class="bfh-logo"
      />

      <div class="footer-text">
        <p>
          {{ t('footer.dataSource') }}
          <a href="https://swissvotes.ch" target="_blank" rel="noopener">Swissvotes</a>
        </p>

        <p>{{ t('footer.projectInfo') }}</p>

        <p>
          {{ t('footer.authors') }}
          <a href="https://www.linkedin.com/in/damian-lienhart-870208299/" target="_blank" rel="noopener">Damian Lienhart</a>,
          <a href="https://www.linkedin.com/in/sujal-singh-basnet-99106a300/" target="_blank" rel="noopener">Sujal Singh Basnet</a>
          <br />
          {{ t('footer.supervisor') }}
          <a href="https://www.simon-kramer.ch/" target="_blank" rel="noopener">Prof. Dr. Simon Kramer</a>
        </p>




        <p>
          {{ t('footer.license') }}
          <a href="https://opensource.org/license/mit/" target="_blank" rel="noopener">MIT</a>.
        </p>

        <p class="footer-year">© 2025 Berner Fachhochschule</p>
      </div>
    </div>
  </footer>
</template>



<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.footer {
  background-color: #f0f0f0;
  padding: 2rem 1rem;
  font-size: 0.85rem;
  border-top: 1px solid #ddd;
  margin-top: 4rem;
  font-family: 'Inter', sans-serif;
}

.footer-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.footer-text {
  color: #444;
  max-width: 700px;
}

.bfh-logo {
  height: 80px;
}

.footer-content a,
.footer-text a {
  color: #2563eb;
  text-decoration: none;
}

.footer-content a:hover,
.footer-text a:hover {
  text-decoration: underline;
}

.footer-year {
  font-weight: 500;
  margin-top: 0.5rem;
  color: #666;
}


@media (min-width: 768px) {
  .footer-wrapper {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    gap: 2rem;
  }

  .bfh-logo {
    margin-top: 0.2rem;
    height: 120px;
  }

  .footer-text {
    flex: 1;
  }
}

</style>
