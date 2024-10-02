<template>
  <v-row>
    <v-col cols="12" class="rc-body18 fw-bold">
      <v-row>
        <v-col class="py-4">
          Design
        </v-col>
      </v-row>
    </v-col>
    <v-col>
      <section v-for="section in sections" :key="section.name">
        <h2>{{ section.label }}</h2>
        <div v-if="['primary', 'secondary', 'cancel', 'transparent'].includes(section.type)">
          <div>
            <rc-btn v-for="size in sizes" :key="size" :type="section.type" :large="size === 'large'" :small="size === 'small'">
              {{ section.label }} {{ size }}
            </rc-btn>
          </div>

          <div>
            <rc-btn v-for="size in sizes" :key="`disabled-${size}`" :type="section.type" :large="size === 'large'" :small="size === 'small'" disabled>
              {{ section.label }} {{ size }} disabled
            </rc-btn>
          </div>
        </div>

        <div v-if="section.type === 'fab'">
          <div>
            <rc-btn v-for="size in sizes" :key="size" :type="section.type" :large="size === 'large'" :small="size === 'small'">
              <v-icon>mdi-plus</v-icon>
            </rc-btn>
            <rc-btn v-for="size in sizes" :key="size" :type="section.type" :large="size === 'large'" :small="size === 'small'" disabled>
              <v-icon>mdi-plus</v-icon>
            </rc-btn>
          </div>
        </div>

        <div v-if="section.type === 'fab-light'">
          <div>
            <rc-btn v-for="size in sizes" :key="size" :type="section.type" :large="size === 'large'" :small="size === 'small'">
              <v-icon>mdi-plus</v-icon>
            </rc-btn>
            <rc-btn v-for="size in sizes" :key="size" :type="section.type" :large="size === 'large'" :small="size === 'small'" disabled>
              <v-icon color="primary-darken-1">
                mdi-plus
              </v-icon>
            </rc-btn>
          </div>
        </div>

        <!-- Back Buttons -->
        <div v-if="section.type === 'back'">
          <rc-btn v-for="size in sizes" :key="size" :type="section.type" :large="size === 'large'" :small="size === 'small'" />
          <rc-btn v-for="size in sizes" :key="`disabled-${size}`" :type="section.type" :large="size === 'large'" :small="size === 'small'" disabled />
        </div>
        <div v-if="section.type === 'back-light'" :style="{ backgroundColor: 'var(--v-primary-darken1)' }">
          <rc-btn v-for="size in sizes" :key="size" :type="section.type" :large="size === 'large'" :small="size === 'small'" />
          <rc-btn v-for="size in sizes" :key="`disabled-${size}`" :type="section.type" :large="size === 'large'" :small="size === 'small'" disabled />
        </div>

        <!-- Inline Icon Buttons -->
        <div v-if="section.type === 'icon'">
          <rc-btn v-for="size in sizes" :key="size" :type="section.type" :large="size === 'large'" :small="size === 'small'">
            <v-icon>mdi-pencil</v-icon>
          </rc-btn>
          <rc-btn v-for="size in sizes" :key="size" :type="section.type" :large="size === 'large'" :small="size === 'small'" disabled>
            <v-icon>mdi-pencil</v-icon>
          </rc-btn>
        </div>
      </section>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Design',

  data() {
    return {
      sections: [
        { name: 'primary', label: 'Primary', type: 'primary' },
        { name: 'secondary', label: 'Secondary', type: 'secondary' },
        { name: 'cancel', label: 'Cancel', type: 'cancel' },
        { name: 'transparent', label: 'Transparent', type: 'transparent' },
        { name: 'fab', label: 'Fab', type: 'fab' },
        { name: 'fab-light', label: 'Fab Light', type: 'fab-light' },
        { name: 'back', label: 'Back', type: 'back' },
        { name: 'back-light', label: 'Back Light', type: 'back-light' },
        { name: 'icon', label: 'Icon', type: 'icon' },
      ],
      sizes: ['large', 'default', 'small'],
    };
  },
});
</script>

<style scoped>

</style>
