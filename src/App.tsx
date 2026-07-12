const App = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Restauration requise</h1>
      <p style={{ color: "#555", lineHeight: 1.5 }}>
        Les dossiers <code>src/pages</code>, <code>src/components</code>, <code>src/contexts</code> et <code>src/hooks</code> sont manquants dans le projet.
        Veuillez restaurer une version précédente depuis l'historique (commit « Mise à jour » du 12 juillet, <code>22cb5fb8</code>) pour retrouver le site AgriCapital.
      </p>
    </div>
  </div>
);

export default App;
