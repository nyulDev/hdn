# TODO

- [x] Optimasi performa modal detail di `src/app/modal-aktual/page.tsx`
  - [x] Hapus retry+delay pada `refreshDetailData`
  - [x] Tambahkan AbortController untuk membatalkan request detail sebelumnya saat klik cepat
  - [x] Tambahkan cache detail per `noQuo` sehingga klik untuk `noQuo` yang sama langsung tampil
- [x] Pastikan UI loading/error tetap berfungsi
  - [ ] Jalankan dev server & uji klik detail cepat/berulang
