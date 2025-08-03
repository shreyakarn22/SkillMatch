// Navigation highlighting and smooth scroll
function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('href').replace('#', '');
      scrollToSection(target);
      setActiveNav(target);
      if (target === 'history') setTimeout(loadHistory, 300);
    });
  });
  
  function setActiveNav(id) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }
  
  // Analyzer logic
  const API_URL = 'http://localhost:3001/api';
  let allSkills = [];
  
  async function loadAnalyzerData() {
    try {
      const res = await fetch(`${API_URL}/data`);
      const data = await res.json();
      allSkills = data.allSkills;
  
      // Populate job roles
      const jobRoleSelect = document.getElementById('jobRole');
      if (!jobRoleSelect) return;
      jobRoleSelect.innerHTML = '<option value="">Select a job role</option>';
      data.jobRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.name;
        option.textContent = role.name;
        jobRoleSelect.appendChild(option);
      });
  
      // Render skills in custom dropdown
      renderSkillsDropdown();
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please try again later.');
    }
  }
  
  function renderSkillsDropdown(selected = []) {
    const dropdown = document.getElementById('skillsDropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    allSkills.forEach(skill => {
      const label = document.createElement('label');
      label.className = 'dropdown-checkbox-label';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = skill;
      checkbox.checked = selected.includes(skill);
      checkbox.addEventListener('change', updateSelectedSkills);
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(' ' + skill));
      dropdown.appendChild(label);
    });
  }
  
  function updateSelectedSkills() {
    const dropdown = document.getElementById('skillsDropdown');
    if (!dropdown) return;
    
    const selected = Array.from(dropdown.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    renderSelectedSkills(selected);
  }
  
  function renderSelectedSkills(selected) {
    const selectedSkillsDiv = document.getElementById('selectedSkills');
    if (!selectedSkillsDiv) return;
    
    selectedSkillsDiv.innerHTML = '';
    selected.forEach(skill => {
      const chip = document.createElement('span');
      chip.className = 'skill-chip';
      chip.textContent = skill;
      chip.onclick = () => {
        // Uncheck in dropdown
        const dropdown = document.getElementById('skillsDropdown');
        const cb = Array.from(dropdown.querySelectorAll('input[type="checkbox"]')).find(c => c.value === skill);
        if (cb) cb.checked = false;
        updateSelectedSkills();
      };
      selectedSkillsDiv.appendChild(chip);
    });
  }
  
  // Dropdown open/close logic
  document.addEventListener('DOMContentLoaded', () => {
    loadAnalyzerData();
  
    const btn = document.getElementById('skillsDropdownBtn');
    const dropdown = document.getElementById('skillsDropdown');
    
    if (btn && dropdown) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        btn.classList.toggle('open');
      });
  
      // Close dropdown if clicked outside
      document.addEventListener('click', function(e) {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove('show');
          btn.classList.remove('open');
        }
      });
    }
  
    // Form submit
    const skillForm = document.getElementById('skillForm');
    if (skillForm) {
      skillForm.addEventListener('submit', handleForm);
    }
  });
  
  async function handleForm(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const jobRole = document.getElementById('jobRole').value;
    const dropdown = document.getElementById('skillsDropdown');
    const userSkills = Array.from(dropdown.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  
    if (!name || !email || !jobRole || userSkills.length === 0) {
      alert('Please fill all fields and select at least one skill.');
      return;
    }
  
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, jobRole, userSkills })
      });
      const report = await res.json();
      showReport(report);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again later.');
    }
  }
  
  function showReport(report) {
    const reportDiv = document.getElementById('report');
    if (!reportDiv) return;
    
    if (report.error) {
      reportDiv.innerHTML = `<p style="color:#b00020;">${report.error}</p>`;
      reportDiv.classList.add('active');
      return;
    }
  
    // Progress bar for skill match
    const progressBar = `
      <div class="progress-bar-container">
        <div class="progress-bar" style="width:${report.matchPercent}%;">
          ${report.matchPercent}%
        </div>
      </div>
    `;
  
    reportDiv.innerHTML = `
      <h2>Skill Gap Report</h2>
      <p><strong>Name:</strong> ${report.name}</p>
      <p><strong>Email:</strong> ${report.email}</p>
      <p><strong>Job Role:</strong> ${report.jobRole}</p>
      ${progressBar}
      <p><strong>Matched Skills:</strong> ${report.matchedSkills.length > 0 ? report.matchedSkills.join(', ') : 'None'}</p>
      <p><strong>Skills to Add & Learn:</strong></p>
      <ul>
        ${report.missingSkills.map(skill => `<li>${skill}</li>`).join('')}
      </ul>
      <button class="download-btn" onclick="downloadReport()">Download Report</button>
      <p style="color:#888; font-size:0.95em;">Tip: Focus on learning the above skills to improve your fit for the ${report.jobRole} role!</p>
    `;
    
    reportDiv.classList.add('active');
    reportDiv.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Download report as PDF
  window.downloadReport = function() {
    const reportDiv = document.getElementById('report');
    const doc = new window.jspdf.jsPDF();
    let y = 10;
    
    reportDiv.querySelectorAll('h2, p, ul, li').forEach(el => {
      if (el.tagName === 'H2') {
        doc.setFontSize(16);
        doc.text(el.textContent, 10, y);
        y += 10;
      } else if (el.tagName === 'P') {
        doc.setFontSize(12);
        doc.text(el.textContent, 10, y);
        y += 8;
      } else if (el.tagName === 'UL') {
        el.querySelectorAll('li').forEach(li => {
          doc.text('- ' + li.textContent, 14, y);
          y += 7;
        });
      }
    });
    
    doc.save('SkillMatch_Report.pdf');
  };
  
 
  