<template>
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">Case Details</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Case ID:</strong> {{ caseData.id }}</p>
          <p><strong>Title:</strong> {{ caseData.title }}</p>
          <p><strong>Status:</strong> {{ caseData.stats.status }}</p>
          <p><strong>High Table Approval:</strong> {{ caseData.stats.highTableApproval }}</p>
        </div>
        <div>
          <p><strong>Case Owner:</strong> {{ caseData.stats.caseOwner }}</p>
          <p><strong>Legal Firm:</strong> {{ caseData.stats.legalFirm }}</p>
          <p><strong>Jurisdiction:</strong> {{ caseData.caseDetails.jurisdiction }}</p>
          <p><strong>Incident Date:</strong> {{ caseData.caseDetails.incidentDate }}</p>
        </div>
      </div>
      <div class="mt-4">
        <p><strong>Case Type:</strong> {{ caseData.caseDetails.caseType }}</p>
        <p><strong>Evidence Summary:</strong> {{ caseData.caseDetails.evidenceSummary }}</p>
      </div>
      <div class="mt-4">
        <h3 class="text-xl font-semibold mb-2">Funding Details</h3>
        <p><strong>Goal:</strong> {{ caseData.stats.goal }} {{ caseData.stats.currency }}</p>
        <p><strong>Current Balance:</strong> {{ caseData.stats.balance }} {{ caseData.stats.currency }}</p>
        <p><strong>Withdrawn:</strong> {{ caseData.stats.withdrawn }} {{ caseData.stats.currency }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { PropType } from 'vue';
  
  const props = defineProps({
    caseData: {
      type: Object as PropType<any>,
      required: true
    }
  });
  </script>