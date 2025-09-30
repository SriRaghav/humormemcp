(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();class l{allServers=[];filteredServers=[];filterState={section:"all",search:"",sortField:"name",sortOrder:"asc",currentPage:1};itemsPerPage=20;sectionColors={reference:{border:"border-green-200",background:"bg-green-50",badge:"bg-green-100 text-green-800"},archived:{border:"border-gray-200",background:"bg-gray-50",badge:"bg-gray-100 text-gray-800"},"third-party":{border:"border-blue-200",background:"bg-blue-50",badge:"bg-blue-100 text-blue-800"},community:{border:"border-purple-200",background:"bg-purple-50",badge:"bg-purple-100 text-purple-800"}};async loadServers(){try{const e=await fetch("mcp_servers.json");if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);const t=await e.json();this.allServers=t.servers,this.applyFilters(),this.displayStats(t),this.updateLastUpdated(t.extraction_timestamp)}catch(e){console.error("Error loading servers:",e),this.displayError()}}setFilter(e){this.filterState.section=e,this.filterState.currentPage=1,this.applyFilters()}setSearch(e){this.filterState.search=e,this.filterState.currentPage=1,this.applyFilters()}setSorting(e,t){this.filterState.sortField=e,this.filterState.sortOrder=t,this.applyFilters()}setPage(e){const t=Math.ceil(this.filteredServers.length/this.itemsPerPage);e>=1&&e<=t&&(this.filterState.currentPage=e,this.displayServers())}applyFilters(){this.filteredServers=this.allServers.filter(e=>{const t=this.filterState.section==="all"||e.section===this.filterState.section,i=this.filterState.search===""||e.name.toLowerCase().includes(this.filterState.search.toLowerCase())||e.description.toLowerCase().includes(this.filterState.search.toLowerCase());return t&&i}),this.filteredServers.sort((e,t)=>{const i=this.filterState.sortField==="name"?e.name.toLowerCase():e.section,r=this.filterState.sortField==="name"?t.name.toLowerCase():t.section,s=i.localeCompare(r);return this.filterState.sortOrder==="asc"?s:-s}),this.displayServers()}displayServers(){const e=document.getElementById("servers");if(!e)return;if(this.filteredServers.length===0){e.innerHTML=this.getEmptyStateHTML();return}const t=Math.ceil(this.filteredServers.length/this.itemsPerPage),i=(this.filterState.currentPage-1)*this.itemsPerPage,r=i+this.itemsPerPage,s=this.filteredServers.slice(i,r);e.innerHTML=`
      <div class="flex justify-between items-center mb-6">
        <div class="text-sm text-gray-600">
          Showing ${i+1}-${Math.min(r,this.filteredServers.length)} of ${this.filteredServers.length} servers
        </div>
        ${t>1?this.renderPagination(t):""}
      </div>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        ${s.map(a=>this.renderServerCard(a)).join("")}
      </div>
      ${t>1?`<div class="mt-8 flex justify-center">${this.renderPagination(t)}</div>`:""}
    `,this.attachPaginationListeners(t)}renderServerCard(e){const t=this.sectionColors[e.section];return`
      <div class="group bg-white rounded-xl border-2 ${t.border} ${t.background} p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            <a href="${e.link}" target="_blank" rel="noopener noreferrer" class="hover:underline">
              ${this.escapeHtml(e.name)}
            </a>
          </h3>
          <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        <p class="text-gray-600 text-sm mb-4 line-clamp-3">
          ${this.escapeHtml(e.description)}
        </p>
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.badge}">
            ${e.section.charAt(0).toUpperCase()+e.section.slice(1).replace("-"," ")}
          </span>
          <a href="${e.link}" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View →
          </a>
        </div>
      </div>
    `}renderPagination(e){const t=[],r=this.filterState.currentPage;let s=Math.max(1,r-Math.floor(5/2)),a=Math.min(e,s+5-1);a-s<4&&(s=Math.max(1,a-5+1)),t.push(`
      <button class="pagination-btn px-3 py-2 text-sm font-medium ${r===1?"text-gray-400 cursor-not-allowed":"text-gray-700 hover:bg-gray-50"} border border-gray-300 rounded-l-md"
              data-page="${r-1}" ${r===1?"disabled":""}>
        Previous
      </button>
    `);for(let n=s;n<=a;n++)t.push(`
        <button class="pagination-btn px-3 py-2 text-sm font-medium border-t border-b border-gray-300 ${n===r?"bg-blue-50 text-blue-600 border-blue-500":"text-gray-700 hover:bg-gray-50"}" data-page="${n}">
          ${n}
        </button>
      `);return t.push(`
      <button class="pagination-btn px-3 py-2 text-sm font-medium ${r===e?"text-gray-400 cursor-not-allowed":"text-gray-700 hover:bg-gray-50"} border border-gray-300 rounded-r-md"
              data-page="${r+1}" ${r===e?"disabled":""}>
        Next
      </button>
    `),`<div class="flex">${t.join("")}</div>`}attachPaginationListeners(e){document.querySelectorAll(".pagination-btn:not([disabled])").forEach(t=>{t.addEventListener("click",i=>{const r=i.target,s=parseInt(r.dataset.page||"1");this.setPage(s)})})}displayStats(e){const t=document.getElementById("stats");t&&(t.innerHTML=`
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">${e.total_servers.toLocaleString()}</div>
          <div class="text-sm text-blue-800 font-medium">Total Servers</div>
        </div>
        <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div class="text-2xl font-bold text-green-600">${e.servers_by_section.reference}</div>
          <div class="text-sm text-green-800 font-medium">Reference</div>
        </div>
        <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">${e.servers_by_section["third-party"]}</div>
          <div class="text-sm text-purple-800 font-medium">Third Party</div>
        </div>
        <div class="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
          <div class="text-2xl font-bold text-indigo-600">${e.servers_by_section.community}</div>
          <div class="text-sm text-indigo-800 font-medium">Community</div>
        </div>
        <div class="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
          <div class="text-2xl font-bold text-gray-600">${e.servers_by_section.archived}</div>
          <div class="text-sm text-gray-800 font-medium">Archived</div>
        </div>
      </div>
    `)}updateLastUpdated(e){const t=document.getElementById("lastUpdated");t&&(t.textContent=new Date(e).toLocaleDateString())}displayError(){const e=document.getElementById("servers");e&&(e.innerHTML=`
        <div class="text-center py-12">
          <div class="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p class="text-gray-500">Failed to load MCP servers data. Please check if mcp_servers.json is available.</p>
        </div>
      `)}getEmptyStateHTML(){return`
      <div class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No servers found</h3>
        <p class="text-gray-500">Try adjusting your search or filters</p>
      </div>
    `}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}updateFilterButtons(){document.querySelectorAll(".section-filter").forEach(e=>{e.dataset.section===this.filterState.section?e.className="section-filter px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-700 border border-blue-300":e.className="section-filter px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"})}}class d{serverManager;searchTimeout=null;constructor(){this.serverManager=new l}async init(){await this.serverManager.loadServers(),this.setupEventListeners()}setupEventListeners(){this.setupSearchInput(),this.setupSectionFilters(),this.setupSortControls()}setupSearchInput(){const e=document.getElementById("searchInput");e&&e.addEventListener("input",t=>{this.searchTimeout&&clearTimeout(this.searchTimeout),this.searchTimeout=window.setTimeout(()=>{const i=t.target;this.serverManager.setSearch(i.value)},300)})}setupSectionFilters(){document.querySelectorAll(".section-filter").forEach(e=>{e.addEventListener("click",t=>{const r=t.target.dataset.section;this.serverManager.setFilter(r),this.serverManager.updateFilterButtons()})})}setupSortControls(){const e=document.getElementById("sortField"),t=document.getElementById("sortOrder");e&&e.addEventListener("change",i=>{const s=i.target.value,a=t?.dataset.order||"asc";this.serverManager.setSorting(s,a)}),t&&(t.dataset.order="asc",t.addEventListener("click",()=>{const r=t.dataset.order==="asc"?"desc":"asc";t.dataset.order=r;const s=t.querySelector("svg");s&&(s.style.transform=r==="desc"?"rotate(180deg)":"rotate(0deg)");const a=e?.value||"name";this.serverManager.setSorting(a,r)}))}}document.addEventListener("DOMContentLoaded",async()=>{await new d().init()});
