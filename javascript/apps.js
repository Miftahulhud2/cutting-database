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
	const oldRows = [...document.querySelectorAll('#tableBody tr')].map((tr) =>
		[...tr.querySelectorAll('input')].map((input) => input.value),
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
	const count = document.querySelectorAll('#tableBody tr').length

	document.getElementById('status').textContent =
		count + ' baris · ' + sizes.length + ' ukuran'
}

// Reset angka tabel
function resetNumbers() {
	if (
		!confirm(
			'Kosongkan semua angka di tabel? Identitas produksi dan nama ukuran tidak akan dihapus.',
		)
	) {
		return
	}

	document.querySelectorAll('#tableBody input.number-cell').forEach((input) => {
		input.value = ''
	})
}

// Cetak
function printPage() {
	window.print()
}

// Ambil daftar nomor dari isi sel, contoh: "5", "1-5", "1,3,7-9"
function parseNumbers(text) {
	const result = []
	text.split(',').forEach((part) => {
		const p = part.trim()
		if (!p) return

		const range = p.match(/^(\d+)\s*[-–]\s*(\d+)$/)
		if (range) {
			const from = parseInt(range[1], 10)
			const to = parseInt(range[2], 10)
			if (from <= to && to - from < 500) {
				for (let n = from; n <= to; n++) result.push(String(n))
				return
			}
		}

		result.push(p)
	})
	return result
}

// Satu label, contoh: 1T atau 1C
function makeLabel(no, suffix, info) {
	const label = document.createElement('div')
	label.className = 'label'

	const big = document.createElement('div')
	big.className = 'label-no'
	big.textContent = no + suffix
	label.append(big)

	const fields = [
		['ROA', info.roa],
		['Babak', info.babak],
		['WO', info.wo],
		['Ukuran', info.size],
		['Jm', info.jm],
	]

	fields.forEach(([name, value]) => {
		if (!value) return
		const line = document.createElement('div')
		line.className = 'label-line'

		const k = document.createElement('span')
		k.textContent = name
		const v = document.createElement('strong')
		v.textContent = value

		line.append(k, v)
		label.append(line)
	})

	return label
}

// Tombol C&T: cetak label nomor T dan C berdampingan
function ctAction() {
	const sheet = document.getElementById('labelSheet')
	sheet.innerHTML = ''

	const get = (id) => document.getElementById(id).value.trim()
	let total = 0

	document.querySelectorAll('#tableBody tr').forEach((tr) => {
		const inputs = [...tr.querySelectorAll('input')]
		const jm = inputs[0].value.trim()

		sizes.forEach((size, i) => {
			const cell = inputs[3 + i]
			if (!cell) return

			parseNumbers(cell.value).forEach((no) => {
				const info = {
					roa: get('roa'),
					babak: get('babak'),
					wo: get('wo'),
					size: size,
					jm: jm,
				}

				const pair = document.createElement('div')
				pair.className = 'label-pair'
				pair.append(makeLabel(no, 'T', info), makeLabel(no, 'C', info))
				sheet.append(pair)
				total++
			})
		})
	})

	if (total === 0) {
		alert('Belum ada nomor di tabel untuk dicetak.')
		return
	}

	document.body.classList.add('print-labels')
	window.print()
}

// Kembalikan tampilan normal setelah dialog cetak ditutup
window.addEventListener('afterprint', () => {
	document.body.classList.remove('print-labels')
})

// Inisialisasi tabel
makeHeader()
document.getElementById('tableBody').append(makeRow())
updateStatus()
