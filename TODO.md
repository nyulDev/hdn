# TODO - Bansos sync fix

- [x] Understand flow: profit/report-quo-bansos should populate `Penjualan.bansos`
- [x] Inspect `GET /api/penjualan` keying: `noInvoice` is used and is `penawaran.noQuo` (trimmed)
- [x] Fix `POST /api/penjualan-sync-bansos-from-profit` update-by-key mismatch by trimming `noInvoice` input
- [x] Fix fallback update-by-`noPenawaran` to match trimmed string exactly
- [ ] Run endpoint POST for failing case (example: noQuo=0002-PH) and verify `/penjualan` shows updated `bansos`
