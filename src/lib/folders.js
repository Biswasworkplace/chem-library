export const FOLDER_TREE = {
  root: {
    label: "My Library",
    children: [
      { id: "organic", name: "Organic Chemistry", icon: "🧪", color: "#e8f5e9" },
      { id: "medicinal", name: "Medicinal Chemistry", icon: "💊", color: "#e3f2fd" },
      { id: "spectroscopy", name: "Spectroscopy", icon: "📡", color: "#f3e5f5" },
      { id: "analytic", name: "Analytical Chemistry", icon: "⚗️", color: "#fff8e1" },
      { id: "physical", name: "Physical Chemistry", icon: "⚛️", color: "#fce4ec" },
      { id: "biochem", name: "Biochemistry", icon: "🧬", color: "#e0f7fa" },
    ]
  },
  organic: {
    label: "Organic Chemistry",
    parent: "root",
    children: [
      { id: "org-nomenclature", name: "Nomenclature & IUPAC", icon: "📝" },
      { id: "org-reactions", name: "Reactions & Mechanisms", icon: "⚗️" },
      { id: "org-stereochem", name: "Stereochemistry", icon: "🔄" },
      { id: "org-carbonyl", name: "Carbonyl Chemistry", icon: "📂" },
      { id: "org-aromatic", name: "Aromatic Chemistry", icon: "⬡" },
      { id: "org-polymers", name: "Polymers", icon: "🔗" },
      { id: "org-hetero", name: "Heterocyclic Chemistry", icon: "🔵" },
      { id: "org-natural", name: "Natural Products", icon: "🌿" },
      { id: "org-synthesis", name: "Retrosynthesis", icon: "🎯" },
      { id: "org-pericyclic", name: "Pericyclic Reactions", icon: "🔃" },
    ]
  },
  spectroscopy: {
    label: "Spectroscopy",
    parent: "root",
    children: [
      { id: "spec-uvvis", name: "UV-Vis Spectroscopy", icon: "🌈" },
      { id: "spec-ir", name: "IR Spectroscopy", icon: "📡" },
      { id: "spec-nmr", name: "NMR Spectroscopy", icon: "🔮" },
      { id: "spec-mass", name: "Mass Spectrometry", icon: "📉" },
      { id: "spec-xray", name: "X-Ray Crystallography", icon: "💎" },
      { id: "spec-raman", name: "Raman Spectroscopy", icon: "✨" },
    ]
  },
  analytic: {
    label: "Analytical Chemistry",
    parent: "root",
    children: [
      { id: "anal-chromatography", name: "Chromatography", icon: "🧫" },
      { id: "anal-titrimetry", name: "Titrimetry", icon: "💧" },
      { id: "anal-electroanalytic", name: "Electroanalytical Methods", icon: "⚡" },
      { id: "anal-gravimetric", name: "Gravimetric Analysis", icon: "⚖️" },
      { id: "anal-qualitative", name: "Qualitative Analysis", icon: "🔍" },
    ]
  },
  physical: {
    label: "Physical Chemistry",
    parent: "root",
    children: [
      { id: "phys-thermo", name: "Thermodynamics", icon: "🌡️" },
      { id: "phys-kinetics", name: "Chemical Kinetics", icon: "⏱️" },
      { id: "phys-quantum", name: "Quantum Chemistry", icon: "🔬" },
      { id: "phys-electrochem", name: "Electrochemistry", icon: "⚡" },
      { id: "phys-solutions", name: "Solutions & Colligative", icon: "💧" },
      { id: "phys-surface", name: "Surface Chemistry", icon: "📐" },
      { id: "phys-solidstate", name: "Solid State Chemistry", icon: "💠" },
    ]
  },
  biochem: {
    label: "Biochemistry",
    parent: "root",
    children: [
      { id: "bio-proteins", name: "Proteins & Enzymes", icon: "🧬" },
      { id: "bio-nucleic", name: "Nucleic Acids", icon: "🔬" },
      { id: "bio-metabolism", name: "Metabolism", icon: "⚡" },
      { id: "bio-lipids", name: "Lipids & Membranes", icon: "🫧" },
      { id: "bio-vitamins", name: "Vitamins & Cofactors", icon: "🍊" },
    ]
  },
  medicinal: {
    label: "Medicinal Chemistry",
    parent: "root",
    sections: [
      {
        label: "Unit I — Introduction",
        children: [
          { id: "med-intro", name: "Intro to Medicinal Chemistry", icon: "📘" },
        ]
      },
      {
        label: "Unit II — Autonomic Nervous System",
        children: [
          { id: "med-cholinergic", name: "Cholinergic Drugs", icon: "🧠" },
          { id: "med-adrenergic", name: "Adrenergic Drugs", icon: "💉" },
        ]
      },
      {
        label: "Unit III — Central Nervous System",
        children: [
          { id: "med-sedatives", name: "Sedatives & Hypnotics", icon: "😴" },
          { id: "med-antipsychotic", name: "Antipsychotic Drugs", icon: "🧠" },
          { id: "med-antidepressant", name: "Antidepressants", icon: "💊" },
          { id: "med-antiepileptic", name: "Antiepileptic Drugs", icon: "⚡" },
          { id: "med-analgesics", name: "Analgesics", icon: "💊" },
          { id: "med-anesthetics", name: "Anesthetics", icon: "🔬" },
          { id: "med-parkinson", name: "Anti-Parkinson Drugs", icon: "🧪" },
        ]
      },
      {
        label: "Unit IV — Cardiovascular System",
        children: [
          { id: "med-antihypertensive", name: "Antihypertensive Drugs", icon: "❤️" },
          { id: "med-antianginal", name: "Antianginal Drugs", icon: "🫀" },
          { id: "med-antiarrhythmic", name: "Antiarrhythmic Drugs", icon: "📈" },
          { id: "med-antihyperlipidemic", name: "Antihyperlipidemic Drugs", icon: "🩺" },
          { id: "med-anticoagulant", name: "Anticoagulants & Antiplatelet", icon: "🩸" },
        ]
      },
      {
        label: "Unit V — Endocrine System",
        children: [
          { id: "med-antidiabetic", name: "Antidiabetic Drugs", icon: "💉" },
          { id: "med-thyroid", name: "Thyroid Drugs", icon: "🦋" },
          { id: "med-steroids", name: "Steroidal Drugs", icon: "⚗️" },
        ]
      },
      {
        label: "Unit VI — Respiratory System",
        children: [
          { id: "med-antiasthmatic", name: "Antiasthmatic Drugs", icon: "🫁" },
          { id: "med-antihistamines", name: "Antihistamines", icon: "💊" },
        ]
      },
      {
        label: "Unit VII — Gastrointestinal",
        children: [
          { id: "med-antiulcer", name: "Antiulcer Drugs", icon: "🧪" },
          { id: "med-antiemetic", name: "Antiemetic Drugs", icon: "💊" },
          { id: "med-laxatives", name: "Laxatives & Antidiarrheal", icon: "📋" },
        ]
      },
      {
        label: "Unit VIII — Anti-Infective Agents",
        children: [
          { id: "med-antibacterial", name: "Antibacterial Drugs", icon: "🦠" },
          { id: "med-antitubercular", name: "Antitubercular Drugs", icon: "🔬" },
          { id: "med-antifungal", name: "Antifungal Drugs", icon: "🍄" },
          { id: "med-antiviral", name: "Antiviral Drugs", icon: "🦠" },
          { id: "med-antimalarial", name: "Antimalarial Drugs", icon: "🌿" },
          { id: "med-anthelmintic", name: "Anthelmintic Drugs", icon: "🪱" },
        ]
      },
      {
        label: "Unit IX — Anticancer Drugs",
        children: [
          { id: "med-anticancer", name: "Anticancer Drugs", icon: "🎗️" },
        ]
      },
      {
        label: "Unit X — Vitamins & Miscellaneous",
        children: [
          { id: "med-vitamins", name: "Vitamins", icon: "🍊" },
          { id: "med-hematinics", name: "Hematinics", icon: "🩸" },
          { id: "med-immunosuppressants", name: "Immunosuppressants", icon: "🛡️" },
          { id: "med-diagnostic", name: "Diagnostic Agents", icon: "📡" },
          { id: "med-modern", name: "Modern Drug Classes", icon: "🔬" },
        ]
      }
    ]
  }
}

// All leaf folder IDs (no children, can hold files)
export const ALL_FOLDERS = []
function collectFolders(tree, parentId = null) {
  Object.entries(tree).forEach(([id, node]) => {
    if (id === 'root') return
    const kids = node.children || (node.sections ? node.sections.flatMap(s => s.children) : [])
    if (kids.length === 0) {
      ALL_FOLDERS.push({ id, label: node.label || id, parent: parentId })
    } else {
      kids.forEach(k => {
        if (!tree[k.id]) {
          ALL_FOLDERS.push({ id: k.id, label: k.name, parent: id })
        }
      })
    }
  })
}
collectFolders(FOLDER_TREE)
