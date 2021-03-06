<template>
  <b-container>
    <b-row>
      <b-navbar>
        <b-navbar-brand href="#">Yavin</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse" />
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item>Suspicious</b-nav-item>
            <b-nav-item>Clean</b-nav-item>
            <b-nav-item>To Analyze</b-nav-item>
            <b-nav-item>Everything</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </b-row>
    <b-row v-if="messages">
      <b-col cols="4">
        <b-row class="paginator">
          <b-col>
            <button @click="prevPage" :disabled="!canPrevPage">&laquo;</button
            ><span class="status"
              >{{ pageStart + 1 }} to {{ pageEnd }} of
              {{ messages.length }}</span
            ><button @click="nextPage" :disabled="!canNextPage">&raquo;</button>
          </b-col>
        </b-row>
        <b-row v-for="(message, i) in pagedMessages" :key="i">
          <b-col>
            <Summary
              :brief="message"
              :selected="i + pageStart === currMessageIndex"
              @click="show(i)"
            />
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="8">
        <Details v-if="message" :details="message" />
        <p v-else>Select a message to view.</p>
      </b-col>
    </b-row>
    <b-row v-else>
      <b-col>
        <h1>Loading...</h1>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
// HACK: Vue can't find the window.fetch type
import { fetch } from 'whatwg-fetch';
import { Vue, Component } from 'vue-property-decorator';
import { EmailResponse } from '../types';
import Summary from '../components/Summary.vue';
import Details from '../components/Details.vue';

/**
 * Number of times to retry getting emails
 */
const MAX_ATTEMPTS = 3;
/**
 * Number of email summaries to show per page
 */
const PAGE_SIZE = 8;

async function getEmails(attempt = 1): Promise<EmailResponse[]> {
  if (attempt > MAX_ATTEMPTS) throw new Error('Could not load emails');
  try {
    const resp = await fetch('//localhost:9999/emails');
    const ms: EmailResponse[] = await resp.json();
    return ms;
  } catch (e) {
    console.warn(`getEmails: attempt ${attempt} failed, retrying`);
    console.warn(e);
    return getEmails(attempt + 1);
  }
}

@Component({
  components: { Summary, Details },
})
export default class Inbox extends Vue {
  messages: EmailResponse[] | null = null;

  message: EmailResponse | null = null;

  currMessageIndex: number | null = null;

  page = 0;

  get pages(): number {
    if (!this.messages) return 0;
    return Math.ceil(this.messages.length / PAGE_SIZE);
  }

  get pageStart(): number {
    return PAGE_SIZE * this.page;
  }

  get pageEnd(): number {
    return Math.min(PAGE_SIZE * (this.page + 1), this.messages.length);
  }

  get pagedMessages(): EmailResponse[] {
    if (!this.messages) return [];
    return this.messages.slice(this.pageStart, this.pageEnd);
  }

  get canPrevPage(): boolean {
    return this.page > 0;
  }

  get canNextPage(): boolean {
    return this.page < this.pages - 1;
  }

  async mounted(): Promise<void> {
    this.messages = await getEmails();
  }

  show(i: number): void {
    if (!this.messages) return;
    this.currMessageIndex = i + this.pageStart;
    this.message = this.messages[this.currMessageIndex];
  }

  nextPage(): void {
    if (!this.canNextPage) return;
    this.page += 1;
  }

  prevPage(): void {
    if (!this.canPrevPage) return;
    this.page -= 1;
  }
}
</script>

<style lang="stylus">
bright-blue = #3498db // Flat UI Colors: Peter River
dark-blue = #2980b9 // Flat UI Colors: Belize Hole

nav
  width: 100%

.paginator
  text-align: center
  margin-bottom: 8px
  .status
    display: inline-block
    min-width: 120px
    margin-left: 8px
    margin-right: 8px
  button
    border: none
    border-radius: 4px
    color: white
    font-weight: 800
    padding: 3px 10px
    background: bright-blue
    &:hover
      background: dark-blue
    &:disabled
      color: rgba(0, 0, 0, 0.2)
      background-color: rgba(0, 0, 0, 0.1)
</style>
