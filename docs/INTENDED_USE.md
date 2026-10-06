# FORGE intended use

FORGE supports controlled CMC source intake, typed technical facts, completeness/conflict review, descriptive batch comparison, evidence-linked 3.2.S/3.2.P draft preparation, independent deterministic QC, revision-bound human decisions, controlled evidence packages, selective change impact and historical replay.

Users: CMC/Regulatory Affairs reviewers, RegOps contributors and authorized QA collaborators. Current executed evidence is synthetic engineering evidence. No real-company records, clinical proof or customer adoption are asserted.

Supported deterministic source schemas: UTF-8 JSON parameters array and CSV containing parameter,value,unit,method,batch,low,high,basis. Optional fields: product,facility,condition,timePoint,timeUnit. Original UTF-8 BOM and numeric/limit lexemes remain preserved; unsafe numeric range/precision and ambiguous CSV layouts are held. Typed XML and controlled DOCX/XLSX parameter tables are supported through preserved original bytes. Unknown/ambiguous values remain candidates or held states. Original number lexemes and original source spans are preserved.

PDF/PNG/JPEG bytes can be stored with identity, permissions and SHA-256. Configured document inference creates candidates requiring original-page human inspection. Provider configuration and representative independent extraction evaluation remain required.

A human decides scientific relevance, comparability, reporting category and disposition. FORGE does not autonomously submit a dossier, release a batch, grant legal clearance or establish eCTD/GxP/Part 11 conformance.
