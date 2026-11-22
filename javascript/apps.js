
let sizes = ['S', 'M']
let rows = 1
let nextId = 1

function inputCell(value = '', placeholder = '') {
    const input = document.createElement('input')
    input.type = 'text'
    input.value = value
    input.placeholder = placeholder
    input.className = 'number-cell'
    return input
}

function makeHeader() {
    const head = document.getElementById('tableHead')
    head.innerHTML = ''

    const top = document.createElement('tr')

    const fixed = document.createElement('th')
    fixed.rowSpan = 2
    fixed.className = 'fixed-col'
    fixed.textContent = 'Jumlah Patokan'

    const no = document.createElement('th')
    no.colSpan = 2
    no.textContent = 'No Patokan'

    top.append(fixed, no)

    sizes.forEach((size, index) => {
        const th = document.createElement('th')
        th.rowSpan = 2
        th.className = 'group-head'

        const wrap = document.createElement('div')
        wrap.style.display = 'flex'
        wrap.style.gap = '5px'
        wrap.style.alignItems = 'center'

        const name = document.createElement('input')
        name.value = size
        name.setAttribute('aria-label', 'Nama ukuran')

        name.addEventListener('input', () => {
            sizes[index] = name.value
        })

        const del = document.createElement('button')
        del.className = 'small danger no-print'
        del.type = 'button'
        del.textContent = '×'
        del.title = 'Hapus ukuran'
        del.onclick = () => deleteSize(index)

        wrap.append(name, del)
        th.append(wrap)
        top.append(th)
    })

    const action = document.createElement('th')
    action.rowSpan = 2
    action.className = 'no-print'
    action.textContent = 'Aksi'

    top.append(action)

    const sub = document.createElement('tr')

    ;['No Awal', 'No Akhir'].forEach((x) => {
        const th = document.createElement('th')
        th.textContent = x
        th.className = 'subhead'
        sub.append(th)
    })

    head.append(top, sub)
}

function makeRow() {
    const tr = document.createElement('tr')
    tr.dataset.rowId = nextId++

    // Jm dan No Patokan
    tr.append(makeTd(inputCell('', 'Jm')))
    tr.append(makeTd(inputCell('', 'No awal')))
    tr.append(makeTd(inputCell('', 'No akhir')))

    // Satu kolom Nomor untuk setiap ukuran
    sizes.forEach(() => {
        tr.append(makeTd(inputCell('', 'Masukkan nomor')))
    })

    // Tombol hapus baris
    const td = document.createElement('td')
    td.className = 'no-print'

    const del = document.createElement('button')
    del.className = 'small danger row-delete'
    del.textContent = 'Hapus'

    del.onclick = () => {
        tr.remove()
        updateStatus()
    }

    td.append(del)
    tr.append(td)

    return tr
}

function makeTd(input) {
    const td = document.createElement('td')
    td.append(input)
    return td
}

// Tambah baris
function addRow() {
    document.getElementById('tableBody').append(makeRow())
    rows++
    updateStatus()
}

// Tambah ukuran
function addSize() {
    sizes.push('Ukuran ' + (sizes.length + 1))
    rebuildTable()
}

// Hapus ukuran
function deleteSize(index) {
    if (sizes.length <= 1) {
        alert('Minimal harus ada satu kolom ukuran.')
        return
    }

    if (!confirm('Hapus kolom ukuran ini beserta datanya?')) {
        return
    }

    sizes.splice(index, 1)
    rebuildTable()
}

// Bangun ulang tabel sambil mempertahankan data
function rebuildTable() {
    const oldRows = [
        ...document.querySelectorAll('#tableBody tr')
    ].map((tr) =>
        [...tr.querySelectorAll('input')].map((input) => input.value)
    )

    makeHeader()

    const body = document.getElementById('tableBody')
    body.innerHTML = ''

    oldRows.forEach((values) => {
        const tr = makeRow()
        const inputs = [...tr.querySelectorAll('input')]

        // Pertahankan Jm dan No Patokan
        inputs[0].value = values[0] || ''
        inputs[1].value = values[1] || ''
        inputs[2].value = values[2] || ''

        // Pertahankan nomor setiap ukuran
        sizes.forEach((_, i) => {
            inputs[3 + i].value = values[3 + i] || ''
        })

        body.append(tr)
    })

    updateStatus()
}

// Update status tabel
function updateStatus() {
    const count = document.querySelectorAll(
        '#tableBody tr'
    ).length

    document.getElementById('status').textContent =
        count + ' baris · ' + sizes.length + ' ukuran'
}

// Reset angka tabel
function resetNumbers() {
    if (
        !confirm(
            'Kosongkan semua angka di tabel? Identitas produksi dan nama ukuran tidak akan dihapus.'
        )
    ) {
        return
    }

    document
        .querySelectorAll('#tableBody input.number-cell')
        .forEach((input) => {
            input.value = ''
        })
}

// Cetak
function printPage() {
    window.print()
}

// Tombol C&T sementara
function ctAction() {
    alert(
        'Fungsi C&T belum diatur. Silakan tentukan proses yang diinginkan.'
    )
}

// Inisialisasi tabel
makeHeader()
document.getElementById('tableBody').append(makeRow())
updateStatus()
