<template>
  <div class="party-glossary">
    <h4>{{ $t('common.partyGlossary') }}</h4>
    <ul>
      <li v-for="party in partyKeys" :key="party">
        <strong>{{ $t(`parties.${party}.short`) }}</strong>:
        {{ $t(`parties.${party}.full`) }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">

const partyKeys = [
  "fdp", "sps", "svp", "mitte", "evp", "gps", "glp",
  "pda", "sd", "edu", "fps", "lega", "kvp", "mcg",
  "ucsp", "cvp", "bdp", "lps", "ldu", "poch", "rep"
]

</script>

<style scoped>
.party-glossary {
  background: #f9f9f9;
  padding: 1rem;
  margin-top: 2rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  max-width: 600px;
}
.party-glossary ul {
  list-style-type: none;
  padding: 0;
}
.party-glossary li {
  margin-bottom: 0.5rem;
}
</style>
