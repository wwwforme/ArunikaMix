const {
    useState,
    useEffect,
    useMemo
} = React;


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://hldsxluraxvsxscjfbqf.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_UHd_c11RvO2W814V17CbrA_v3WmdRF0";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_TEMPLATE_NAME = "Arunika";

const DEFAULT_NAMES = [
    "Agung Pranaja",
    "Aina Salsabil",
    "Ainul Mardhiah",
    "Azfar Syahmi Al Akbar",
    "Fhyan Farikha Andi",
    "Iffanda Putri Vallendini",
    "Kansya Asqira Madhani Alam",
    "Khayla Eka Anugerah",
    "La Ode Abdul Raja Mananti",
    "La Ode Muhammad Syaban Hasnan",
    "Mahira Hasna Kamila Mustam",
    "Muh. Nur Alim",
    "Muhammad Fajar Ayyatullah An Nur",
    "Naizar Al Azmi K",
    "Nanda Saputri",
    "Nur Zahwa Syarifuddin",
    "Nurul Mutmainnah",
    "Oriza Putri Virany H.",
    "Raslan Syarsid",
    "Rasya Muhammad Athaya",
    "Sahlaa Zahidah Hawwaa M.",
    "Wa Ode Dini Dzakirah Lukman",
    "Wa Ode Kamalia Putri",
    "Wa Ode Ibnaty Nurul Aini S.",
    "Waldan Risallah Ampaeja",
    "Wa Ode Zalni Nining Pratiwi",
    "Zaim Andrias Adhimukti",
    "Zakiyah Khoirunnisa"
];

const GROUP_COLORS = [
    "#e87868",
    "#e8b34d",
    "#76a99a",
    "#4b304d",
    "#86abb4",
    "#d78b88",
    "#93b99d",
    "#ba8850"
];


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEYS = {
    currentAttendance:
        "arunikamix_current_attendance_v4",

    history:
        "arunikamix_shuffle_history_v5"
};


/* =========================================================
   STORAGE HELPERS
========================================================= */

function readStorage(key, fallback) {
    try {
        const raw =
            localStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        return JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
}


function writeStorage(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    } catch (error) {
        console.error(
            "Gagal menyimpan localStorage:",
            error
        );
    }
}


/* =========================================================
   GENERAL HELPERS
========================================================= */

function shuffleArray(array) {
    const result = [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }

    return result;
}


function cleanNames(text) {
    return text
        .split("\n")
        .map(name => name.trim())
        .filter(Boolean);
}


async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        try {
            const textarea =
                document.createElement("textarea");

            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand("copy");

            textarea.remove();

            return true;
        } catch (fallbackError) {
            return false;
        }
    }
}


/* =========================================================
   GROUP HELPERS
========================================================= */

function splitIntoGroups(names, count) {
    const shuffled =
        shuffleArray(names);

    const groups =
        Array.from(
            {
                length: count
            },
            () => []
        );

    shuffled.forEach(
        (name, index) => {
            groups[
                index % count
            ].push(name);
        }
    );

    return groups;
}


function makeDuelPairs(names) {
    const shuffled =
        shuffleArray(names);

    const pairs = [];

    for (
        let i = 0;
        i < shuffled.length;
        i += 2
    ) {
        pairs.push([
            shuffled[i],
            shuffled[i + 1] || null
        ]);
    }

    return pairs;
}


/* =========================================================
   HISTORY
========================================================= */

function saveHistory(
    type,
    title,
    data
) {
    const history =
        readStorage(
            STORAGE_KEYS.history,
            []
        );

    const newItem = {
        id:
            Date.now() +
            Math.random(),

        type,

        title,

        data,

        createdAt:
            new Date().toISOString()
    };

    const updated =
        [
            newItem,
            ...history
        ].slice(0, 50);

    writeStorage(
        STORAGE_KEYS.history,
        updated
    );
}


function formatHistoryDate(date) {
    try {
        return new Intl.DateTimeFormat(
            "id-ID",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        ).format(
            new Date(date)
        );
    } catch (error) {
        return "";
    }
}


function getHistoryIcon(type) {
    if (type === "groups") {
        return "users";
    }

    if (type === "duel") {
        return "shuffle";
    }

    if (type === "queue") {
        return "list";
    }

    if (type === "wheel") {
        return "rotate";
    }

    return "list";
}


function getHistoryPreview(item) {
    if (!item || !item.data) {
        return "";
    }

    if (
        item.type === "groups" &&
        Array.isArray(item.data)
    ) {
        return item.data
            .map(
                (group, index) =>
                    `Kelompok ${index + 1}: ${
                        group.join(", ")
                    }`
            )
            .join(" • ");
    }

    if (
        item.type === "duel" &&
        Array.isArray(item.data)
    ) {
        return item.data
            .map(
                (pair, index) =>
                    `Duel ${index + 1}: ${
                        pair[0]
                    }${
                        pair[1]
                            ? ` vs ${pair[1]}`
                            : " — bye"
                    }`
            )
            .join(" • ");
    }

    if (
        item.type === "queue" &&
        Array.isArray(item.data)
    ) {
        return item.data
            .map(
                (name, index) =>
                    `${index + 1}. ${name}`
            )
            .join(" • ");
    }

    if (item.type === "wheel") {
        return `Pemenang: ${
            item.data.winner || "-"
        }`;
    }

    return "";
}


/* =========================================================
   ICON
========================================================= */

function Icon({
    name,
    size = 18
}) {
    const icons = {

        users: `
            <circle cx="9" cy="8" r="3"></circle>
            <path d="M3 19c0-3.2 2.5-5 6-5s6 1.8 6 5"></path>
            <path d="M16 5.5c2.2.2 3.5 1.6 3.5 3.6"></path>
            <path d="M16.5 14.2c1.9.7 3 2.2 3.2 4.8"></path>
        `,

        rotate: `
            <path d="M21 12a9 9 0 1 1-2.64-6.36"></path>
            <path d="M21 3v6h-6"></path>
        `,

        shuffle: `
            <path d="M16 3h5v5"></path>
            <path d="M4 20L21 3"></path>
            <path d="M21 16v5h-5"></path>
            <path d="M15 15l6 6"></path>
            <path d="M4 4l5 5"></path>
        `,

        list: `
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
        `,

        trash: `
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-1 14H6L5 6"></path>
            <path d="M10 11v5"></path>
            <path d="M14 11v5"></path>
            <path d="M9 6V3h6v3"></path>
        `,

        plus: `
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        `,

        edit: `
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        `,

        save: `
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        `,

        copy: `
            <rect x="9" y="9" width="11" height="11" rx="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        `,

        chevron: `
            <polyline points="6 9 12 15 18 9"></polyline>
        `,

        x: `
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        `,

        check: `
            <polyline points="20 6 9 17 4 12"></polyline>
        `
    };

    return (
        <svg
            className="icon"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            dangerouslySetInnerHTML={{
                __html:
                    icons[name] ||
                    icons.list
            }}
        />
    );
}


/* =========================================================
   TOAST
========================================================= */

function useToast() {
    const [
        toast,
        setToast
    ] = useState(null);

    function showToast(
        message,
        type = "default"
    ) {
        setToast({
            message,
            type
        });

        window.setTimeout(
            () => {
                setToast(null);
            },
            2600
        );
    }

    return {
        toast,
        showToast
    };
}


function Toast({
    toast
}) {
    if (!toast) {
        return null;
    }

    return (
        <div
            className={
                `toast toast-${toast.type}`
            }
        >
            <span className="toast-dot"></span>

            <span>
                {toast.message}
            </span>
        </div>
    );
}


/* =========================================================
   MODE NAVIGATION
========================================================= */

const MODES = [
    {
        id: "groups",
        label: "Pembagi Kelompok",
        icon: "users"
    },
    {
        id: "wheel",
        label: "Roda Putar",
        icon: "rotate"
    },
    {
        id: "duel",
        label: "Undian Berpasangan",
        icon: "shuffle"
    },
    {
        id: "queue",
        label: "Urutan Antrean",
        icon: "list"
    }
];


function ModeNav({
    mode,
    setMode
}) {
    return (
        <nav className="mode-nav">

            {MODES.map(item => (

                <button
                    key={item.id}
                    className={
                        `mode-tab ${
                            mode === item.id
                                ? "active"
                                : ""
                        }`
                    }
                    onClick={() =>
                        setMode(item.id)
                    }
                >

                    <span className="mode-tab-icon">
                        <Icon
                            name={item.icon}
                            size={16}
                        />
                    </span>

                    <span>
                        {item.label}
                    </span>

                </button>

            ))}

        </nav>
    );
}


/* =========================================================
   ATTENDANCE MANAGER
========================================================= */

function AttendanceManager({
    names,
    setNames,
    user,
    selectedList,
    setSelectedList,
    showToast
}) {
    const [
        input,
        setInput
    ] = useState("");

    const [
        savedLists,
        setSavedLists
    ] = useState([]);

    const [
        showSaved,
        setShowSaved
    ] = useState(false);

    const [
        loading,
        setLoading
    ] = useState(false);


    async function loadLists() {
        if (!user) {
            setSavedLists([]);
            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("attendance_lists")
                .select("*")
                .order(
                    "updated_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            console.error(error);
            return;
        }

        setSavedLists(
            data || []
        );
    }


    useEffect(() => {
        loadLists();
    }, [user]);


    function addNames() {
        const added =
            cleanNames(input);

        if (!added.length) {
            showToast(
                "Belum ada nama yang ditambahkan.",
                "error"
            );

            return;
        }

        setNames(current => [
            ...current,
            ...added
        ]);

        setInput("");

        showToast(
            `${added.length} nama ditambahkan.`,
            "success"
        );
    }


    function deleteName(index) {
        setNames(current =>
            current.filter(
                (_, i) =>
                    i !== index
            )
        );

        showToast(
            "Nama dihapus dari daftar.",
            "success"
        );
    }


    function clearNames() {
        if (!names.length) {
            return;
        }

        const confirmed =
            window.confirm(
                "Hapus semua nama dari daftar?"
            );

        if (!confirmed) {
            return;
        }

        setNames([]);

        showToast(
            "Daftar nama dikosongkan.",
            "success"
        );
    }


    function resetDefault() {
        setNames([
            ...DEFAULT_NAMES
        ]);

        setSelectedList(null);

        showToast(
            "Daftar dikembalikan ke Arunika.",
            "success"
        );
    }


    async function createNewList() {
        if (!user) {
            showToast(
                "Masuk terlebih dahulu untuk menyimpan daftar.",
                "error"
            );

            return;
        }

        const name =
            window.prompt(
                "Nama daftar baru:",
                "Daftar Baru"
            );

        if (
            !name ||
            !name.trim()
        ) {
            return;
        }

        setLoading(true);

        const {
            data,
            error
        } =
            await supabaseClient
                .from("attendance_lists")
                .insert({
                    user_id: user.id,
                    name: name.trim(),
                    names: []
                })
                .select("*")
                .single();

        setLoading(false);

        if (error) {
            console.error(error);

            showToast(
                `Gagal membuat daftar: ${error.message}`,
                "error"
            );

            return;
        }

        setSelectedList(data);
        setNames([]);

        await loadLists();

        showToast(
            "Daftar baru dibuat.",
            "success"
        );
    }


    async function saveCurrentList() {
        if (!user) {
            showToast(
                "Masuk terlebih dahulu untuk menyimpan daftar.",
                "error"
            );

            return;
        }

        setLoading(true);

        let data;
        let error;

        if (
            selectedList &&
            selectedList.id
        ) {
            ({
                data,
                error
            } =
                await supabaseClient
                    .from("attendance_lists")
                    .update({
                        name:
                            selectedList.name,

                        names,

                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        selectedList.id
                    )
                    .select("*")
                    .single());
        } else {
            ({
                data,
                error
            } =
                await supabaseClient
                    .from("attendance_lists")
                    .insert({
                        user_id: user.id,

                        name:
                            DEFAULT_TEMPLATE_NAME,

                        names
                    })
                    .select("*")
                    .single());
        }

        setLoading(false);

        if (error) {
            console.error(error);

            showToast(
                `Gagal menyimpan: ${error.message}`,
                "error"
            );

            return;
        }

        setSelectedList(data);

        await loadLists();

        showToast(
            "Daftar berhasil disimpan.",
            "success"
        );
    }


    async function renameList(list) {
        const name =
            window.prompt(
                "Nama daftar:",
                list.name
            );

        if (
            !name ||
            !name.trim()
        ) {
            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("attendance_lists")
                .update({
                    name: name.trim(),

                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    list.id
                )
                .select("*")
                .single();

        if (error) {
            showToast(
                `Gagal mengubah nama: ${error.message}`,
                "error"
            );

            return;
        }

        if (
            selectedList &&
            selectedList.id === list.id
        ) {
            setSelectedList(data);
        }

        await loadLists();

        showToast(
            "Nama daftar diperbarui.",
            "success"
        );
    }


    async function deleteList(list) {
        const confirmed =
            window.confirm(
                `Hapus daftar "${list.name}"?`
            );

        if (!confirmed) {
            return;
        }

        const {
            error
        } =
            await supabaseClient
                .from("attendance_lists")
                .delete()
                .eq(
                    "id",
                    list.id
                );

        if (error) {
            showToast(
                `Gagal menghapus: ${error.message}`,
                "error"
            );

            return;
        }

        if (
            selectedList &&
            selectedList.id === list.id
        ) {
            setSelectedList(null);
            setNames([]);
        }

        await loadLists();

        showToast(
            "Daftar dihapus.",
            "success"
        );
    }


    function openList(list) {
        setSelectedList(list);

        setNames(
            Array.isArray(list.names)
                ? list.names
                : []
        );

        setShowSaved(false);

        showToast(
            `"${list.name}" dibuka.`,
            "success"
        );
    }


    return (
        <aside className="attendance-panel">

            <div className="panel-heading">

                <div>

                    <div className="eyebrow">
                        DAFTAR PESERTA
                    </div>

                    <h3>
                        {selectedList?.name ||
                            DEFAULT_TEMPLATE_NAME}
                    </h3>

                </div>

                <div className="participant-count">
                    {names.length}
                </div>

            </div>


            <div className="attendance-input">

                <textarea
                    value={input}
                    onChange={e =>
                        setInput(
                            e.target.value
                        )
                    }
                    placeholder={
                        "Tambahkan nama...\nSatu nama per baris"
                    }
                    rows={4}
                />

                <button
                    className="btn btn-secondary add-member-button"
                    onClick={addNames}
                >
                    <span className="button-icon-box">
                        <Icon
                            name="plus"
                            size={15}
                        />
                    </span>

                    Tambahkan anggota
                </button>

            </div>


            <div className="attendance-actions">

                <button
                    className="small-action"
                    onClick={resetDefault}
                >
                    <Icon
                        name="rotate"
                        size={14}
                    />

                    Reset awal
                </button>

                <button
                    className="small-action danger"
                    onClick={clearNames}
                >
                    <Icon
                        name="trash"
                        size={14}
                    />

                    Hapus semua
                </button>

            </div>


            <div className="participant-list">

                {names.length === 0 ? (

                    <div className="empty-participants">
                        Belum ada nama.
                    </div>

                ) : (

                    names.map(
                        (name, index) => (

                            <div
                                className="participant-row"
                                key={`${name}-${index}`}
                            >

                                <span className="participant-number">
                                    {String(
                                        index + 1
                                    ).padStart(
                                        2,
                                        "0"
                                    )}
                                </span>

                                <span className="participant-name">
                                    {name}
                                </span>

                                <button
                                    className="participant-delete"
                                    onClick={() =>
                                        deleteName(
                                            index
                                        )
                                    }
                                    aria-label={
                                        `Hapus ${name}`
                                    }
                                >
                                    <Icon
                                        name="x"
                                        size={14}
                                    />
                                </button>

                            </div>

                        )
                    )

                )}

            </div>


            <div className="saved-area">

                <button
                    className={
                        `saved-toggle ${
                            showSaved
                                ? "open"
                                : ""
                        }`
                    }
                    onClick={() =>
                        setShowSaved(
                            value => !value
                        )
                    }
                >

                    <span className="saved-toggle-left">

                        <span className="saved-toggle-mark">
                            <Icon
                                name="save"
                                size={14}
                            />
                        </span>

                        <span>
                            Daftar tersimpan
                        </span>

                    </span>

                    <Icon
                        name="chevron"
                        size={15}
                    />

                </button>


                {showSaved && (

                    <div className="saved-list">

                        <div className="saved-list-actions">

                            <button
                                className="small-action"
                                onClick={
                                    createNewList
                                }
                                disabled={loading}
                            >
                                <Icon
                                    name="plus"
                                    size={14}
                                />

                                Baru
                            </button>

                            <button
                                className="small-action accent"
                                onClick={
                                    saveCurrentList
                                }
                                disabled={loading}
                            >
                                <Icon
                                    name="save"
                                    size={14}
                                />

                                Simpan
                            </button>

                        </div>


                        {!user ? (

                            <div className="saved-empty">
                                Masuk untuk menyimpan daftar.
                            </div>

                        ) : savedLists.length === 0 ? (

                            <div className="saved-empty">
                                Belum ada daftar tersimpan.
                            </div>

                        ) : (

                            savedLists.map(
                                list => (

                                    <div
                                        className="saved-item"
                                        key={list.id}
                                    >

                                        <button
                                            className="saved-item-main"
                                            onClick={() =>
                                                openList(
                                                    list
                                                )
                                            }
                                        >
                                            <span>
                                                {list.name}
                                            </span>

                                            <small>
                                                {
                                                    Array.isArray(
                                                        list.names
                                                    )
                                                        ? list.names.length
                                                        : 0
                                                }{" "}
                                                nama
                                            </small>
                                        </button>

                                        <button
                                            className="saved-item-icon"
                                            onClick={() =>
                                                renameList(
                                                    list
                                                )
                                            }
                                            aria-label="Ubah nama"
                                        >
                                            <Icon
                                                name="edit"
                                                size={14}
                                            />
                                        </button>

                                        <button
                                            className="saved-item-icon danger"
                                            onClick={() =>
                                                deleteList(
                                                    list
                                                )
                                            }
                                            aria-label="Hapus daftar"
                                        >
                                            <Icon
                                                name="trash"
                                                size={14}
                                            />
                                        </button>

                                    </div>

                                )
                            )

                        )}

                    </div>

                )}

            </div>

        </aside>
    );
}


/* =========================================================
   HISTORY PANEL
========================================================= */

function HistoryPanel({
    showToast
}) {
    const [
        open,
        setOpen
    ] = useState(false);

    const [
        history,
        setHistory
    ] = useState(() =>
        readStorage(
            STORAGE_KEYS.history,
            []
        )
    );


    function refreshHistory() {
        setHistory(
            readStorage(
                STORAGE_KEYS.history,
                []
            )
        );
    }


    useEffect(() => {
        const handler =
            () => refreshHistory();

        window.addEventListener(
            "arunikamix-history-updated",
            handler
        );

        return () => {
            window.removeEventListener(
                "arunikamix-history-updated",
                handler
            );
        };
    }, []);


    function deleteHistory(id) {
        const updated =
            history.filter(
                item =>
                    item.id !== id
            );

        writeStorage(
            STORAGE_KEYS.history,
            updated
        );

        setHistory(updated);

        showToast(
            "Riwayat dihapus.",
            "success"
        );
    }


    function clearHistory() {
        if (!history.length) {
            return;
        }

        const confirmed =
            window.confirm(
                "Hapus seluruh riwayat acakan?"
            );

        if (!confirmed) {
            return;
        }

        writeStorage(
            STORAGE_KEYS.history,
            []
        );

        setHistory([]);

        showToast(
            "Semua riwayat dihapus.",
            "success"
        );
    }


    return (
        <section className="history-section">

            <button
                className="history-toggle"
                onClick={() =>
                    setOpen(
                        value => !value
                    )
                }
            >

                <span className="history-toggle-left">

                    <span className="history-toggle-icon">
                        <Icon
                            name="rotate"
                            size={17}
                        />
                    </span>

                    <span>

                        <span className="history-toggle-title">
                            Riwayat Acakan
                        </span>

                        <span className="history-toggle-subtitle">
                            {history.length} hasil tersimpan
                        </span>

                    </span>

                </span>


                <span className="history-toggle-right">

                    <span className="history-count">
                        {history.length}
                    </span>

                    <span
                        className={
                            `history-toggle-arrow ${
                                open
                                    ? "open"
                                    : ""
                            }`
                        }
                    >
                        <Icon
                            name="chevron"
                            size={16}
                        />
                    </span>

                </span>

            </button>


            {open && (

                <div className="history-body">

                    {history.length === 0 ? (

                        <div className="history-empty">
                            Belum ada hasil acakan.
                        </div>

                    ) : (

                        <>

                            <div className="history-list">

                                {history.map(
                                    item => (

                                        <div
                                            className="history-item"
                                            key={item.id}
                                        >

                                            <div className="history-item-icon">
                                                <Icon
                                                    name={
                                                        getHistoryIcon(
                                                            item.type
                                                        )
                                                    }
                                                    size={16}
                                                />
                                            </div>


                                            <div className="history-item-content">

                                                <div className="history-item-title">
                                                    {item.title}
                                                </div>

                                                <div className="history-item-date">
                                                    {
                                                        formatHistoryDate(
                                                            item.createdAt
                                                        )
                                                    }
                                                </div>

                                                <div className="history-item-preview">
                                                    {
                                                        getHistoryPreview(
                                                            item
                                                        )
                                                    }
                                                </div>

                                            </div>


                                            <button
                                                className="history-item-delete"
                                                onClick={() =>
                                                    deleteHistory(
                                                        item.id
                                                    )
                                                }
                                                aria-label="Hapus riwayat"
                                            >
                                                <Icon
                                                    name="trash"
                                                    size={15}
                                                />
                                            </button>

                                        </div>

                                    )
                                )}

                            </div>


                            <div className="history-footer">

                                <button
                                    className="history-clear"
                                    onClick={
                                        clearHistory
                                    }
                                >
                                    <Icon
                                        name="trash"
                                        size={14}
                                    />

                                    Hapus semua riwayat
                                </button>

                            </div>

                        </>

                    )}

                </div>

            )}

        </section>
    );
}


/* =========================================================
   GROUP MODE
========================================================= */

function GroupMode({
    names,
    showToast
}) {
    const [
        groupCount,
        setGroupCount
    ] = useState(
        Math.min(
            4,
            names.length || 1
        )
    );

    const [
        groups,
        setGroups
    ] = useState([]);


    useEffect(() => {
        if (!names.length) {
            setGroupCount(1);
            setGroups([]);
            return;
        }

        setGroupCount(
            current =>
                Math.min(
                    current,
                    names.length
                )
        );
    }, [names.length]);


    function mixGroups() {
        if (!names.length) {
            showToast(
                "Tambahkan nama terlebih dahulu.",
                "error"
            );

            return;
        }

        const count =
            Math.min(
                groupCount,
                names.length
            );

        const result =
            splitIntoGroups(
                names,
                count
            );

        setGroups(result);

        saveHistory(
            "groups",
            `${count} kelompok`,
            result
        );

        window.dispatchEvent(
            new Event(
                "arunikamix-history-updated"
            )
        );

        showToast(
            "Kelompok berhasil diacak.",
            "success"
        );
    }


    async function copyGroups() {
        if (!groups.length) {
            return;
        }

        const text =
            groups
                .map(
                    (group, index) =>
                        `KELOMPOK ${
                            index + 1
                        }\n${group
                            .map(
                                name =>
                                    `• ${name}`
                            )
                            .join("\n")}`
                )
                .join("\n\n");

        const success =
            await copyText(text);

        showToast(
            success
                ? "Hasil kelompok disalin."
                : "Gagal menyalin hasil.",
            success
                ? "success"
                : "error"
        );
    }


    return (
        <section className="mode-panel">

            <div className="mode-heading">

                <div className="eyebrow">
                    PEMBAGI KELOMPOK
                </div>

                <h2>
                    Bagi peserta secara adil
                </h2>

                <p>
                    Acak semua nama dan sebarkan
                    secara merata ke beberapa kelompok.
                </p>

            </div>


            <div className="group-controls">

                <div className="control-field">

                    <label>
                        Jumlah kelompok
                    </label>

                    <select
                        value={groupCount}
                        onChange={e =>
                            setGroupCount(
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    >

                        {Array.from(
                            {
                                length:
                                    Math.max(
                                        1,
                                        names.length
                                    )
                            },
                            (_, index) => (

                                <option
                                    value={
                                        index + 1
                                    }
                                    key={
                                        index + 1
                                    }
                                >
                                    {index + 1}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <button
                    className="btn btn-primary group-mix-button"
                    onClick={mixGroups}
                >

                    <Icon
                        name="shuffle"
                        size={17}
                    />

                    Acak & Bagi Kelompok

                </button>

            </div>


            {groups.length > 0 && (

                <div className="results-toolbar">

                    <span>
                        Hasil acakan
                    </span>

                    <button
                        className="small-action"
                        onClick={copyGroups}
                    >
                        <Icon
                            name="copy"
                            size={14}
                        />

                        Salin
                    </button>

                </div>

            )}


            {groups.length > 0 && (

                <div className="group-results">

                    {groups.map(
                        (group, index) => (

                            <div
                                className="group-card"
                                key={index}
                                style={{
                                    "--group-color":
                                        GROUP_COLORS[
                                            index %
                                            GROUP_COLORS.length
                                        ]
                                }}
                            >

                                <div className="group-card-accent"></div>

                                <div className="group-card-title">
                                    Kelompok{" "}
                                    {index + 1}
                                </div>

                                <div className="group-card-list">

                                    {group.map(
                                        (
                                            name,
                                            memberIndex
                                        ) => (

                                            <div
                                                className="group-card-member"
                                                key={`${name}-${memberIndex}`}
                                            >
                                                <span className="member-dot"></span>

                                                {name}
                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </section>
    );
}


/* =========================================================
   SPIN WHEEL
========================================================= */

function SpinWheel({
    names,
    setNames,
    showToast
}) {
    const [
        spinning,
        setSpinning
    ] = useState(false);

    const [
        rotation,
        setRotation
    ] = useState(0);

    const [
        winner,
        setWinner
    ] = useState(null);

    const [
        removeWinner,
        setRemoveWinner
    ] = useState(false);


    const total =
        names.length;

    const sector =
        total > 0
            ? 360 / total
            : 360;


    function shortWheelName(name) {
        const parts =
            name
                .trim()
                .split(/\s+/);

        if (parts.length === 1) {
            return parts[0];
        }

        if (
            parts[0] === "La" &&
            parts[1] === "Ode"
        ) {
            return (
                `La Ode ${
                    parts[2] || ""
                }`
            ).trim();
        }

        if (
            parts[0] === "Wa" &&
            parts[1] === "Ode"
        ) {
            return (
                `Wa Ode ${
                    parts[2] || ""
                }`
            ).trim();
        }

        return (
            `${parts[0]} ${
                parts[1]?.[0] || ""
            }`
        ).trim();
    }


    function spin() {
        if (
            spinning ||
            total === 0
        ) {
            return;
        }

        const targetIndex =
            Math.floor(
                Math.random() * total
            );

        const targetName =
            names[targetIndex];

        /*
         * Karena pointer berada di posisi
         * 12 o'clock, pusat sektor target
         * diarahkan tepat ke atas.
         */

        const targetCenter =
            (
                targetIndex +
                0.5
            ) * sector;

        const targetAngle =
            -targetCenter;

        const extraSpins =
            7 * 360;

        /*
         * Gunakan rotation terakhir sebagai
         * titik awal agar arah visual tetap
         * konsisten walaupun roda sudah pernah
         * diputar sebelumnya.
         */

        const normalized =
            rotation % 360;

        const correction =
            targetAngle -
            normalized;

        const finalRotation =
            rotation +
            extraSpins +
            correction;

        setWinner(null);

        setSpinning(true);

        setRotation(
            finalRotation
        );


        window.setTimeout(
            () => {

                setWinner(
                    targetName
                );

                setSpinning(false);


                saveHistory(
                    "wheel",
                    "Roda Putar",
                    {
                        winner:
                            targetName
                    }
                );


                window.dispatchEvent(
                    new Event(
                        "arunikamix-history-updated"
                    )
                );


                if (
                    removeWinner
                ) {
                    setNames(
                        current =>
                            current.filter(
                                (
                                    _,
                                    index
                                ) =>
                                    index !==
                                    targetIndex
                            )
                    );
                }


                showToast(
                    `Terpilih: ${targetName}`,
                    "success"
                );

            },
            4600
        );
    }


    const wheelBackground =
        total > 0
            ? `conic-gradient(
                from -90deg,
                ${names
                    .map(
                        (
                            _,
                            index
                        ) => {

                            const start =
                                index *
                                sector;

                            const end =
                                (
                                    index +
                                    1
                                ) *
                                sector;

                            const color =
                                GROUP_COLORS[
                                    index %
                                    GROUP_COLORS.length
                                ];

                            return (
                                `${color} ${start}deg ${end}deg`
                            );

                        }
                    )
                    .join(", ")}
            )`
            : "var(--line)";


    return (
        <section className="mode-panel">

            <div className="mode-heading">

                <div className="eyebrow">
                    RODA PUTAR
                </div>

                <h2>
                    Biarkan roda memilih
                </h2>

                <p>
                    Putar roda dan biarkan satu
                    nama terpilih secara acak.
                </p>

            </div>


            {total === 0 ? (

                <div className="mode-empty">
                    Tambahkan peserta terlebih dahulu.
                </div>

            ) : (

                <div className="wheel-layout">

                    <div className="wheel-stage">

                        <div className="wheel-pointer">
                            <span></span>
                        </div>


                        <div
                            className="wheel"
                            style={{
                                background:
                                    wheelBackground,

                                transform:
                                    `rotate(${rotation}deg)`
                            }}
                        >

                            {names.map(
                                (
                                    name,
                                    index
                                ) => {

                                    const angle =
                                        (
                                            index +
                                            0.5
                                        ) *
                                        sector;

                                    return (
                                        <div
                                            key={`${name}-${index}`}
                                            className="wheel-label"
                                            style={{
                                                transform:
                                                    `rotate(${angle}deg) translateY(-38%)`
                                            }}
                                        >

                                            <span>
                                                {
                                                    shortWheelName(
                                                        name
                                                    )
                                                }
                                            </span>

                                        </div>
                                    );

                                }
                            )}


                            <div className="wheel-center">

                                <span className="wheel-center-small">
                                    ARUNIKA
                                </span>

                            </div>

                        </div>

                    </div>


                    <div className="wheel-controls">

                        <button
                            className="btn btn-primary wheel-spin-button"
                            onClick={spin}
                            disabled={
                                spinning ||
                                total === 0
                            }
                        >

                            <Icon
                                name="rotate"
                                size={17}
                            />

                            {spinning
                                ? "Memutar..."
                                : "Putar Roda"}

                        </button>


                        <label className="wheel-option">

                            <input
                                type="checkbox"
                                checked={
                                    removeWinner
                                }
                                onChange={e =>
                                    setRemoveWinner(
                                        e.target.checked
                                    )
                                }
                                disabled={
                                    spinning
                                }
                            />

                            <span>
                                Hapus nama yang terpilih
                            </span>

                        </label>


                        {winner &&
                            !spinning && (

                                <div className="wheel-winner">

                                    <div className="wheel-winner-label">
                                        TERPILIH
                                    </div>

                                    <div className="wheel-winner-name">
                                        {winner}
                                    </div>

                                </div>

                            )}

                    </div>

                </div>

            )}

        </section>
    );
}


/* =========================================================
   DUEL TOOL
========================================================= */

function DuelTool({
    names,
    showToast
}) {
    const [
        pairs,
        setPairs
    ] = useState([]);


    function drawDuel() {
        if (names.length < 2) {
            showToast(
                "Minimal 2 peserta.",
                "error"
            );

            return;
        }

        const result =
            makeDuelPairs(names);

        setPairs(result);

        saveHistory(
            "duel",
            "Undian Berpasangan",
            result
        );

        window.dispatchEvent(
            new Event(
                "arunikamix-history-updated"
            )
        );

        showToast(
            "Pasangan berhasil diacak.",
            "success"
        );
    }


    async function copyDuel() {
        if (!pairs.length) {
            return;
        }

        const text =
            pairs
                .map(
                    (pair, index) =>
                        `Duel ${
                            index + 1
                        }: ${pair[0]}${
                            pair[1]
                                ? ` vs ${pair[1]}`
                                : " — bye"
                        }`
                )
                .join("\n");

        const success =
            await copyText(text);

        showToast(
            success
                ? "Hasil pasangan disalin."
                : "Gagal menyalin hasil.",
            success
                ? "success"
                : "error"
        );
    }


    return (
        <section className="mode-panel">

            <div className="mode-heading">

                <div className="eyebrow">
                    UNDIAN BERPASANGAN
                </div>

                <h2>
                    Pasangkan peserta
                </h2>

                <p>
                    Acak nama menjadi pasangan
                    secara otomatis.
                </p>

            </div>


            <button
                className="btn btn-primary"
                onClick={drawDuel}
            >

                <Icon
                    name="shuffle"
                    size={17}
                />

                Acak Pasangan

            </button>


            {pairs.length > 0 && (

                <>

                    <div className="results-toolbar">

                        <span>
                            Hasil pasangan
                        </span>

                        <button
                            className="small-action"
                            onClick={copyDuel}
                        >

                            <Icon
                                name="copy"
                                size={14}
                            />

                            Salin

                        </button>

                    </div>


                    <div className="duel-results">

                        {pairs.map(
                            (
                                pair,
                                index
                            ) => (

                                <div
                                    className="duel-card"
                                    key={index}
                                >

                                    <div className="duel-number">
                                        {String(
                                            index + 1
                                        ).padStart(
                                            2,
                                            "0"
                                        )}
                                    </div>

                                    <div className="duel-names">

                                        <span>
                                            {pair[0]}
                                        </span>

                                        <b>
                                            VS
                                        </b>

                                        <span>
                                            {pair[1] ||
                                                "BYE"}
                                        </span>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </>

            )}

        </section>
    );
}


/* =========================================================
   QUEUE TOOL
========================================================= */

function QueueTool({
    names,
    showToast
}) {
    const [
        queue,
        setQueue
    ] = useState([]);


    function makeQueue() {
        if (!names.length) {
            showToast(
                "Tambahkan nama terlebih dahulu.",
                "error"
            );

            return;
        }

        const result =
            shuffleArray(names);

        setQueue(result);

        saveHistory(
            "queue",
            "Urutan Antrean",
            result
        );

        window.dispatchEvent(
            new Event(
                "arunikamix-history-updated"
            )
        );

        showToast(
            "Urutan berhasil diacak.",
            "success"
        );
    }


    async function copyQueue() {
        if (!queue.length) {
            return;
        }

        const text =
            queue
                .map(
                    (name, index) =>
                        `${index + 1}. ${name}`
                )
                .join("\n");

        const success =
            await copyText(text);

        showToast(
            success
                ? "Urutan disalin."
                : "Gagal menyalin hasil.",
            success
                ? "success"
                : "error"
        );
    }


    return (
        <section className="mode-panel">

            <div className="mode-heading">

                <div className="eyebrow">
                    URUTAN ANTREAN
                </div>

                <h2>
                    Tentukan siapa duluan
                </h2>

                <p>
                    Acak semua peserta menjadi
                    urutan antrean baru.
                </p>

            </div>


            <button
                className="btn btn-primary"
                onClick={makeQueue}
            >

                <Icon
                    name="shuffle"
                    size={17}
                />

                Acak Urutan

            </button>


            {queue.length > 0 && (

                <>

                    <div className="results-toolbar">

                        <span>
                            Hasil urutan
                        </span>

                        <button
                            className="small-action"
                            onClick={copyQueue}
                        >

                            <Icon
                                name="copy"
                                size={14}
                            />

                            Salin

                        </button>

                    </div>


                    <div className="queue-results">

                        {queue.map(
                            (
                                name,
                                index
                            ) => (

                                <div
                                    className={
                                        `queue-item ${
                                            index === 0
                                                ? "first"
                                                : ""
                                        }`
                                    }
                                    key={`${name}-${index}`}
                                >

                                    <div className="queue-number-wrap">

                                        <span className="queue-number">
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        {index <
                                            queue.length -
                                                1 && (
                                            <span className="queue-line"></span>
                                        )}

                                    </div>


                                    <div className="queue-item-content">

                                        <span className="queue-position-label">
                                            {index === 0
                                                ? "PERTAMA"
                                                : `URUTAN ${
                                                    index +
                                                    1
                                                }`}
                                        </span>

                                        <span className="queue-name">
                                            {name}
                                        </span>

                                    </div>


                                    {index === 0 && (

                                        <span className="queue-first-mark">
                                            <Icon
                                                name="check"
                                                size={14}
                                            />
                                        </span>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                </>

            )}

        </section>
    );
}


/* =========================================================
   AUTH PANEL
========================================================= */

function AuthPanel({
    user,
    onUserChange,
    showToast
}) {
    const [
        email,
        setEmail
    ] = useState("");

    const [
        password,
        setPassword
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);


    async function signIn() {
        if (
            !email.trim() ||
            !password
        ) {
            showToast(
                "Isi email dan password.",
                "error"
            );

            return;
        }

        setLoading(true);

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({
                    email:
                        email.trim(),

                    password
                });

        setLoading(false);

        if (error) {
            showToast(
                error.message,
                "error"
            );

            return;
        }

        onUserChange(
            data.user
        );

        showToast(
            "Berhasil masuk.",
            "success"
        );
    }


    async function signUp() {
        if (
            !email.trim() ||
            !password
        ) {
            showToast(
                "Isi email dan password.",
                "error"
            );

            return;
        }

        setLoading(true);

        const redirectUrl =
            window.location.origin +
            window.location.pathname;

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signUp({
                    email:
                        email.trim(),

                    password,

                    options: {
                        emailRedirectTo:
                            redirectUrl
                    }
                });

        setLoading(false);

        if (error) {
            showToast(
                error.message,
                "error"
            );

            return;
        }

        if (data.user) {
            onUserChange(
                data.user
            );
        }

        showToast(
            "Pendaftaran berhasil. Cek email jika konfirmasi diperlukan.",
            "success"
        );
    }


    async function signOut() {
        await supabaseClient.auth.signOut();

        onUserChange(null);

        showToast(
            "Berhasil keluar.",
            "success"
        );
    }


    if (user) {

        return (
            <div className="auth-user">

                <div className="auth-user-info">

                    <span className="auth-status-dot"></span>

                    <span>
                        {user.email}
                    </span>

                </div>

                <button
                    className="auth-button"
                    onClick={signOut}
                >
                    Keluar
                </button>

            </div>
        );
    }


    return (
        <div className="auth-panel">

            <div className="auth-fields">

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e =>
                        setEmail(
                            e.target.value
                        )
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e =>
                        setPassword(
                            e.target.value
                        )
                    }
                />

            </div>


            <div className="auth-actions">

                <button
                    className="auth-button"
                    onClick={signIn}
                    disabled={loading}
                >
                    Masuk
                </button>

                <button
                    className="auth-button secondary"
                    onClick={signUp}
                    disabled={loading}
                >
                    Daftar
                </button>

            </div>

        </div>
    );
}


/* =========================================================
   APP
========================================================= */

function App() {
    const [
        user,
        setUser
    ] = useState(null);

    const [
        names,
        setNames
    ] = useState(() =>
        readStorage(
            STORAGE_KEYS.currentAttendance,
            DEFAULT_NAMES
        )
    );

    const [
        selectedList,
        setSelectedList
    ] = useState(null);

    const [
        mode,
        setMode
    ] = useState("groups");

    const {
        toast,
        showToast
    } = useToast();


    useEffect(() => {
        let mounted = true;

        async function loadSession() {
            const {
                data
            } =
                await supabaseClient.auth.getSession();

            if (
                mounted &&
                data.session
            ) {
                setUser(
                    data.session.user
                );
            }
        }

        loadSession();

        const {
            data: listener
        } =
            supabaseClient.auth.onAuthStateChange(
                (
                    _event,
                    session
                ) => {

                    if (!mounted) {
                        return;
                    }

                    setUser(
                        session?.user ||
                        null
                    );

                }
            );

        return () => {
            mounted = false;

            listener.subscription.unsubscribe();
        };
    }, []);


    useEffect(() => {
        writeStorage(
            STORAGE_KEYS.currentAttendance,
            names
        );
    }, [names]);


    useEffect(() => {

        if (!user) {
            setSelectedList(null);
            return;
        }

        let cancelled = false;

        async function loadUserLists() {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("attendance_lists")
                    .select("*")
                    .order(
                        "updated_at",
                        {
                            ascending: false
                        }
                    );

            if (
                cancelled ||
                error
            ) {
                return;
            }

            if (
                data &&
                data.length > 0
            ) {

                const first =
                    data[0];

                setSelectedList(
                    first
                );

                if (
                    Array.isArray(
                        first.names
                    )
                ) {
                    setNames(
                        first.names
                    );
                }

                return;
            }


            const {
                data: created,
                error: createError
            } =
                await supabaseClient
                    .from("attendance_lists")
                    .insert({
                        user_id:
                            user.id,

                        name:
                            DEFAULT_TEMPLATE_NAME,

                        names:
                            DEFAULT_NAMES
                    })
                    .select("*")
                    .single();

            if (
                cancelled ||
                createError
            ) {
                console.error(
                    createError
                );

                return;
            }

            setSelectedList(
                created
            );

            setNames(
                DEFAULT_NAMES
            );
        }

        loadUserLists();

        return () => {
            cancelled = true;
        };

    }, [user]);


    function renderMode() {

        if (mode === "groups") {
            return (
                <GroupMode
                    names={names}
                    showToast={showToast}
                />
            );
        }

        if (mode === "wheel") {
            return (
                <SpinWheel
                    names={names}
                    setNames={setNames}
                    showToast={showToast}
                />
            );
        }

        if (mode === "duel") {
            return (
                <DuelTool
                    names={names}
                    showToast={showToast}
                />
            );
        }

        if (mode === "queue") {
            return (
                <QueueTool
                    names={names}
                    showToast={showToast}
                />
            );
        }

        return null;
    }


    return (
        <div className="app">

            <header className="site-header">

                <div className="brand">

                    <div className="brand-mark">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div className="brand-text">

                        <div className="brand-name">
                            ArunikaMix
                        </div>

                        <div className="brand-caption">
                            alat kecil untuk menyatukan orang
                        </div>

                    </div>

                </div>


                <div className="header-right">

                    <div className="header-local">
                        LOKAL SAJA
                    </div>

                    <AuthPanel
                        user={user}
                        onUserChange={
                            setUser
                        }
                        showToast={
                            showToast
                        }
                    />

                </div>

            </header>


            <main className="main">

                <section className="hero">

                    <div className="hero-copy">

                        <div className="eyebrow">
                            PEMBAGI KELOMPOK ACAK & MINI GAMES
                        </div>

                        <h1>
                            Beri ruang
                            <br />
                            untuk kejutan.
                        </h1>

                        <p>
                            Acak peserta, bentuk kelompok,
                            putar roda, atau tentukan urutan.
                            Satu titik awal yang adil.
                        </p>

                    </div>


                    <div className="hero-stamp">

                        <span className="stamp-number">
                            {names.length}
                        </span>

                        <span className="stamp-label">
                            orang di dalamnya
                        </span>

                    </div>

                </section>


                <ModeNav
                    mode={mode}
                    setMode={setMode}
                />


                <section className="workspace">

                    <AttendanceManager
                        names={names}
                        setNames={setNames}
                        user={user}
                        selectedList={
                            selectedList
                        }
                        setSelectedList={
                            setSelectedList
                        }
                        showToast={
                            showToast
                        }
                    />


                    <main className="tool-area">
                        {renderMode()}
                    </main>

                </section>


                <HistoryPanel
                    showToast={showToast}
                />

            </main>


            <footer className="site-footer">

                <div>
                    ARUNIKAMIX
                </div>

                <div>
                    LOKAL SAJA
                </div>

                <div>
                    DATA ACAKAN TERSIMPAN SECARA LOKAL
                </div>

            </footer>


            <Toast
                toast={toast}
            />

        </div>
    );
}


/* =========================================================
   MOUNT
========================================================= */

const root =
    ReactDOM.createRoot(
        document.getElementById(
            "root"
        )
    );

root.render(
    <App />
);
