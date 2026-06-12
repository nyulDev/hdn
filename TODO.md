.# TODO

## Laporan INV - Tambah Input NO. PO

- [x] Identifikasi file UI INV: `src/app/report/inv/page.tsx`
- [x] Identifikasi file API simpan/ambil INV: `src/app/api/report-inv/route.ts`
- [x] Rencanakan penambahan kolom di Prisma model `reportInv`
- [ ] Update UI: tambah state + input field `NO. PO` di bawah input ATSN
- [ ] Update API: terima + simpan field `noPo` ke Prisma `reportInv`
- [x] Update Prisma schema: tambahkan field `noPo`
- [x] Buat migration & push database
- [ ] Testing: simpan dari UI lalu refresh untuk memastikan tampil kembali
