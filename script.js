const {
    useState,
    useEffect
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
    history:
        "arunikamix_shuffle_history_v6"
};


/* =========================================================
   SESSION STORAGE HELPERS
========================================================= */

function readSessionStorage(key, fallback) {
    try {
        const raw =
            sessionStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        return JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
}


function writeSessionStorage(key, value) {
    try {
        sessionStorage.setItem(
            key,
            JSON.stringify(value)
        );
    } catch (error) {
        console.error(
            "Gagal menyimpan sessionStorage:",
            error
        );
    }
}


function clearSessionStorage(key) {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error(
            "Gagal menghapus sessionStorage:",
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
    const safeCount =
        Math.max(
            1,
            Math.min(
                Number(count) || 1,
                names.length || 1
            )
        );

    const shuffled =
        shuffleArray(names);

    const groups =
        Array.from(
            {
                length: safeCount
            },
            () => []
        );

    shuffled.forEach(
        (name, index) => {
            groups[
                index % safeCount
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
    data,
    names = []
) {
    const history =
        readSessionStorage(
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

        names:
            Array.isArray(names)
                ? [...names]
                : [],

        createdAt:
            new Date().toISOString()
    };

    const updated =
        [
            newItem,
            ...history
        ].slice(0, 50);

    writeSessionStorage(
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
            style={{
                color: "var(--plum)",
                background:
                    "var(--paper-light)",
                zIndex: 99999,
                position: "fixed"
            }}
        >
            <span
                className="toast-dot"
                style={{
                    background:
                        "var(--plum)"
                }}
            ></span>

            <span
                className="toast-message"
                style={{
                    color:
                        "var(--plum)",
                    opacity: 1
                }}
            >
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
                    type="button"
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

        try {
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
                console.error(
                    "Gagal memuat daftar:",
                    error
                );

                showToast(
                    `Gagal memuat daftar: ${
                        error.message ||
                        "Coba lagi."
                    }`,
                    "error"
                );

                return;
            }

            // Pastikan data yang diambil berupa Array asli
            const parsedData = (data || []).map(item => {
                let parsedNames = [];
                try {
                    parsedNames = typeof item.names === 'string' 
                        ? JSON.parse(item.names) 
                        : (Array.isArray(item.names) ? item.names : []);
                } catch (e) {
                    parsedNames = [];
                }
                return { ...item, names: parsedNames };
            });

            setSavedLists(parsedData);
        } catch (error) {
            console.error(
                "Gagal memuat daftar:",
                error
            );

            showToast(
                "Gagal memuat daftar tersimpan.",
                "error"
            );
        }
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

        try {
            const {
                data,
                error
            } =
                await supabaseClient
                    .from("attendance_lists")
                    .insert({
                        user_id: user.id,
                        name: name.trim(),
                        names: JSON.stringify([])
                    })
                    .select("*")
                    .single();

            if (error) {
                throw error;
            }

            const newList = {
                ...data,
                names: []
            };

            setSelectedList(newList);
            setNames([]);

            await loadLists();

            showToast(
                "Daftar baru dibuat.",
                "success"
            );
        } catch (error) {
            console.error(error);

            showToast(
                `Gagal membuat daftar: ${
                    error?.message ||
                    "Coba lagi."
                }`,
                "error"
            );
        } finally {
            setLoading(false);
        }
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

        try {
            let data;
            let error;

            const namesJson = JSON.stringify(names);

            // PENTING: Jika sedang membuka daftar (selectedList ada),
            // maka timpa daftar tersebut. Jangan buat baru.
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
                            name: selectedList.name,
                            names: namesJson,
                            updated_at: new Date().toISOString()
                        })
                        .eq(
                            "id",
                            selectedList.id
                        )
                        .select("*")
                        .single());
            } else {
                // Jika belum ada daftar yang dipilih, buat daftar default
                ({
                    data,
                    error
                } =
                    await supabaseClient
                        .from("attendance_lists")
                        .insert({
                            user_id: user.id,
                            name: DEFAULT_TEMPLATE_NAME,
                            names: namesJson
                        })
                        .select("*")
                        .single());
            }

            if (error) {
                throw error;
            }

            // Perbarui state dengan data yang baru disimpan
            setSelectedList({
                ...data,
                names: names // Pastikan state nama tetap sinkron
            });

            await loadLists();

            showToast(
                "Daftar berhasil disimpan.",
                "success"
            );
        } catch (error) {
            console.error(error);

            showToast(
                `Gagal menyimpan: ${
                    error?.message ||
                    "Coba lagi."
                }`,
                "error"
            );
        } finally {
            setLoading(false);
        }
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

        try {
            const {
                data,
                error
            } =
                await supabaseClient
                    .from("attendance_lists")
                    .update({
                        name: name.trim(),
                        updated_at: new Date().toISOString()
                    })
                    .eq(
                        "id",
                        list.id
                    )
                    .select("*")
                    .single();

            if (error) {
                throw error;
            }

            if (
                selectedList &&
                selectedList.id === list.id
            ) {
                setSelectedList({
                    ...data,
                    names: selectedList.names
                });
            }

            await loadLists();

            showToast(
                "Nama daftar diperbarui.",
                "success"
            );
        } catch (error) {
            console.error(error);

            showToast(
                `Gagal mengubah nama: ${
                    error?.message ||
                    "Coba lagi."
                }`,
                "error"
            );
        }
    }


    async function deleteList(list) {
        const confirmed =
            window.confirm(
                `Hapus daftar "${list.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
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
                throw error;
            }

            if (
                selectedList &&
                selectedList.id === list.id
            ) {
                setSelectedList(null);
                setNames([
                    ...DEFAULT_NAMES
                ]);
            }

            await loadLists();

            showToast(
                "Daftar dihapus.",
                "success"
            );
        } catch (error) {
            console.error(error);

            showToast(
                `Gagal menghapus: ${
                    error?.message ||
                    "Coba lagi."
                }`,
                "error"
            );
        }
    }


    function openList(list) {
        setSelectedList(list);

        setNames(
            Array.isArray(list.names)
                ? [...list.names]
                : []
        );

        setShowSaved(false);

        showToast(
            `"${list.name}" dibuka.`,
            "success"
        );
    }


    return (
        <aside
            className="attendance-panel"
            style={{
                paddingLeft: "24px",
                paddingRight: "24px"
            }}
        >

            <div
                className="panel-heading"
                style={{
                    paddingLeft: 0,
                    paddingRight: 0
                }}
            >

                <div className="panel-heading-main">

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


            <div
                className="attendance-input"
                style={{
                    width: "100%"
                }}
            >

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
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        display: "block"
                    }}
                />

                <button
                    type="button"
                    className="btn btn-secondary add-member-button"
                    onClick={addNames}
                    style={{
                        width: "100%"
                    }}
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
                    type="button"
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
                    type="button"
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
                                    type="button"
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
                    type="button"
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
                                type="button"
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
                                type="button"
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
                                            type="button"
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
                                            type="button"
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
                                            type="button"
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
    showToast,
    onSelectHistory
}) {
    const [
        open,
        setOpen
    ] = useState(false);

    const [
        history,
        setHistory
    ] = useState(() =>
        readSessionStorage(
            STORAGE_KEYS.history,
            []
        )
    );


    function refreshHistory() {
        setHistory(
            readSessionStorage(
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

        writeSessionStorage(
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

        clearSessionStorage(
            STORAGE_KEYS.history
        );

        setHistory([]);

        showToast(
            "Semua riwayat dihapus.",
            "success"
        );
    }


    return (
        <section
            className="history-section"
            style={{
                marginTop: "22px"
            }}
        >

            <button
                type="button"
                className="history-toggle"
                onClick={() =>
                    setOpen(
                        value => !value
                    )
                }
                style={{
                    minHeight: "62px"
                }}
            >

                <span className="history-toggle-left">

                    <span
                        className="history-toggle-icon"
                        style={{
                            background:
                                "var(--paper)",
                            color:
                                "var(--plum)"
                        }}
                    >
                        <Icon
                            name="rotate"
                            size={16}
                        />
                    </span>

                    <span>

                        <span
                            className="history-toggle-title"
                            style={{
                                color:
                                    "var(--plum)"
                            }}
                        >
                            Riwayat Acakan
                        </span>

                        <span
                            className="history-toggle-subtitle"
                            style={{
                                color:
                                    "var(--ink-soft)"
                            }}
                        >
                            {history.length} hasil tersimpan
                        </span>

                    </span>

                </span>


                <span className="history-toggle-right">

                    <span
                        className="history-count"
                        style={{
                            color:
                                "var(--plum)"
                        }}
                    >
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

                <div
                    className="history-body"
                    style={{
                        paddingTop: "10px"
                    }}
                >

                    {history.length === 0 ? (

                        <div
                            className="history-empty"
                            style={{
                                color:
                                    "var(--ink-soft)"
                            }}
                        >
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
                                            style={{
                                                background:
                                                    "rgba(255,250,241,.72)",
                                                borderColor:
                                                    "var(--line)"
                                            }}
                                            onClick={() =>
                                                onSelectHistory(
                                                    item
                                                )
                                            }
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={
                                                event => {
                                                    if (
                                                        event.key ===
                                                            "Enter" ||
                                                        event.key ===
                                                            " "
                                                    ) {
                                                        event.preventDefault();

                                                        onSelectHistory(
                                                            item
                                                        );
                                                    }
                                                }
                                            }
                                        >

                                            <div
                                                className="history-item-icon"
                                                style={{
                                                    color:
                                                        "var(--coral-deep)"
                                                }}
                                            >
                                                <Icon
                                                    name={
                                                        getHistoryIcon(
                                                            item.type
                                                        )
                                                    }
                                                    size={15}
                                                />
                                            </div>


                                            <div className="history-item-content">

                                                <div
                                                    className="history-item-title"
                                                    style={{
                                                        color:
                                                            "var(--plum)"
                                                    }}
                                                >
                                                    {item.title}
                                                </div>

                                                <div
                                                    className="history-item-date"
                                                    style={{
                                                        color:
                                                            "var(--ink-soft)"
                                                    }}
                                                >
                                                    {
                                                        formatHistoryDate(
                                                            item.createdAt
                                                        )
                                                    }
                                                </div>

                                                <div
                                                    className="history-item-preview"
                                                    style={{
                                                        color:
                                                            "var(--ink-soft)"
                                                    }}
                                                >
                                                    {
                                                        getHistoryPreview(
                                                            item
                                                        )
                                                    }
                                                </div>

                                            </div>


                                            <button
                                                type="button"
                                                className="history-item-delete"
                                                onClick={
                                                    event => {
                                                        event.stopPropagation();

                                                        deleteHistory(
                                                            item.id
                                                        );
                                                    }
                                                }
                                                aria-label="Hapus riwayat"
                                            >
                                                <Icon
                                                    name="trash"
                                                    size={14}
                                                />
                                            </button>

                                        </div>
                                    )
                                )}

                            </div>


                            <div className="history-footer">

                                <button
                                    type="button"
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
    showToast,
    historySelection
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
                Math.max(
                    1,
                    Math.min(
                        Number(current) || 1,
                        names.length
                    )
                )
        );
    }, [names.length]);


    useEffect(() => {
        if (
            historySelection &&
            historySelection.type === "groups" &&
            Array.isArray(historySelection.data)
        ) {
            setGroups(
                historySelection.data
            );

            setGroupCount(
                Math.min(
                    Math.max(
                        1,
                        historySelection.data.length
                    ),
                    names.length || 1
                )
            );
        }
    }, [historySelection?.id]);


    function handleGroupCountChange(value) {
        if (!names.length) {
            setGroupCount(1);
            return;
        }

        if (
            value === "" ||
            value === null ||
            typeof value === "undefined"
        ) {
            setGroupCount("");
            return;
        }

        const numericValue =
            Number(value);

        if (
            Number.isNaN(
                numericValue
            )
        ) {
            return;
        }

        const safeValue =
            Math.max(
                1,
                Math.min(
                    Math.floor(
                        numericValue
                    ),
                    names.length
                )
            );

        setGroupCount(
            safeValue
        );
    }


    function normalizeGroupCount() {
        if (!names.length) {
            setGroupCount(1);
            return;
        }

        setGroupCount(
            current =>
                Math.max(
                    1,
                    Math.min(
                        Math.floor(
                            Number(current) || 1
                        ),
                        names.length
                    )
                )
        );
    }


    function mixGroups() {
        if (!names.length) {
            showToast(
                "Tambahkan nama terlebih dahulu.",
                "error"
            );

            return;
        }

        const count =
            Math.max(
                1,
                Math.min(
                    Number(groupCount) || 1,
                    names.length
                )
            );

        setGroupCount(count);

        const result =
            splitIntoGroups(
                names,
                count
            );

        setGroups(result);

        saveHistory(
            "groups",
            `${count} kelompok`,
            result,
            names
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


    const safeGroupCount =
        Math.max(
            1,
            Math.min(
                Number(groupCount) || 1,
                names.length || 1
            )
        );

    const averagePerGroup =
        names.length > 0
            ? Math.ceil(
                names.length /
                safeGroupCount
            )
            : 0;


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


            <div
                className="group-controls"
                style={{
                    display: "block"
                }}
            >

                <div
                    className="control-field group-count-field"
                    style={{
                        width: "100%"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            marginBottom: "9px"
                        }}
                    >
                        Banyak kelompok
                    </label>


                    <div
                        className="group-count-input-wrap"
                        style={{
                            width: "100%",
                            minHeight: "58px",
                            display: "flex",
                            alignItems: "center",
                            boxSizing: "border-box",
                            padding:
                                "0 16px",
                            border:
                                "1px solid var(--line)",
                            borderRadius:
                                "14px",
                            background:
                                "var(--paper-light)"
                        }}
                    >

                        <input
                            className="group-count-input"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max={
                                Math.max(
                                    1,
                                    names.length
                                )
                            }
                            value={
                                names.length
                                    ? groupCount
                                    : 1
                            }
                            onChange={e =>
                                handleGroupCountChange(
                                    e.target.value
                                )
                            }
                            onBlur={
                                normalizeGroupCount
                            }
                            disabled={
                                names.length === 0
                            }
                            aria-label="Banyak kelompok"
                            placeholder="0"
                            style={{
                                flex: "1",
                                width: "100%",
                                minWidth: 0,
                                border: "0",
                                outline: "0",
                                background:
                                    "transparent",
                                color:
                                    "var(--plum)",
                                fontFamily:
                                    "var(--font-display)",
                                fontSize:
                                    "32px",
                                fontWeight:
                                    "400",
                                textAlign:
                                    "center"
                            }}
                        />

                    </div>


                    <small
                        className="group-count-hint"
                        style={{
                            display: "block",
                            marginTop: "9px",
                            color:
                                "var(--ink-soft)"
                        }}
                    >
                        ≈ {averagePerGroup} per grup
                        {" • "}
                        seimbang
                    </small>

                </div>


                <button
                    type="button"
                    className="btn btn-primary group-mix-button"
                    onClick={mixGroups}
                    style={{
                        width: "100%",
                        marginTop: "16px"
                    }}
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
                        type="button"
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

                <div
                    className={
                        `group-results group-results-${groups.length}`
                    }
                >

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
    showToast,
    historySelection
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


    useEffect(() => {
        if (
            !historySelection ||
            historySelection.type !== "wheel"
        ) {
            return;
        }

        const savedNames =
            Array.isArray(
                historySelection.names
            ) &&
            historySelection.names.length
                ? historySelection.names
                : names;

        const savedWinner =
            historySelection.data?.winner ||
            null;

        if (
            !savedWinner ||
            !savedNames.length
        ) {
            setWinner(savedWinner);
            return;
        }

        const targetIndex =
            savedNames.indexOf(
                savedWinner
            );

        if (targetIndex < 0) {
            setWinner(savedWinner);
            setRotation(0);
            return;
        }

        const restoredSector =
            360 / savedNames.length;

        const restoredCenter =
            targetIndex *
                restoredSector +
            restoredSector / 2;

        const restoredRotation =
            (
                360 -
                restoredCenter +
                360
            ) % 360;

        setRotation(
            restoredRotation
        );

        setWinner(
            savedWinner
        );

        setSpinning(false);
    }, [historySelection?.id]);


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

        const sectorCenter =
            targetIndex * sector +
            sector / 2;

        const currentMod =
            (
                rotation % 360 +
                360
            ) % 360;

        const desiredMod =
            (
                360 -
                sectorCenter
            ) % 360;

        let delta =
            desiredMod -
            currentMod;

        if (delta < 0) {
            delta += 360;
        }

        const extraSpins =
            7 * 360;

        const finalRotation =
            rotation +
            extraSpins +
            delta;

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
                    },
                    names
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

                            <div className="wheel-center">

                                <span className="wheel-center-small">
                                    ARUNIKA
                                </span>

                            </div>

                        </div>

                    </div>


                    <div className="wheel-controls">

                        <button
                            type="button"
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
    showToast,
    historySelection
}) {
    const [
        pairs,
        setPairs
    ] = useState([]);


    useEffect(() => {
        if (
            historySelection &&
            historySelection.type === "duel" &&
            Array.isArray(historySelection.data)
        ) {
            setPairs(
                historySelection.data
            );
        }
    }, [historySelection?.id]);


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
            result,
            names
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
                type="button"
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
                            type="button"
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
    showToast,
    historySelection
}) {
    const [
        queue,
        setQueue
    ] = useState([]);


    useEffect(() => {
        if (
            historySelection &&
            historySelection.type === "queue" &&
            Array.isArray(historySelection.data)
        ) {
            setQueue(
                historySelection.data
            );
        }
    }, [historySelection?.id]);


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
            result,
            names
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
                type="button"
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
                            type="button"
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


                                    <div
                                        className="queue-item-content"
                                        style={{
                                            color:
                                                "var(--ink)",
                                            minWidth:
                                                0,
                                            flex:
                                                "1",
                                            display:
                                                "flex",
                                            alignItems:
                                                "flex-start",
                                            justifyContent:
                                                "center"
                                        }}
                                    >

                                        <span
                                            className="queue-name"
                                        >
                                            Urutan{" "}
                                            {index + 1}
                                            {": "}
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
   AUTH PANEL — LOGIN MODAL
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

    const [
        showLogin,
        setShowLogin
    ] = useState(false);

    const [
        authError,
        setAuthError
    ] = useState("");


    useEffect(() => {
        if (!showLogin) {
            setAuthError("");
            return;
        }

        function handleKeyDown(event) {
            if (
                event.key === "Escape"
            ) {
                setShowLogin(false);
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [showLogin]);


    function clearAuthError() {
        if (authError) {
            setAuthError("");
        }
    }


    function openLogin() {
        setAuthError("");
        setShowLogin(true);
    }


    function closeLogin() {
        if (loading) {
            return;
        }

        setAuthError("");
        setShowLogin(false);
    }


    async function signIn() {

        if (loading) {
            return;
        }

        setAuthError("");

        const cleanEmail =
            email.trim();

        if (
            !cleanEmail ||
            !password
        ) {
            const message =
                "Isi email dan password.";

            setAuthError(message);

            showToast(
                message,
                "error"
            );

            return;
        }

        if (
            !window.supabase ||
            !supabaseClient ||
            !supabaseClient.auth
        ) {
            const message =
                "Sistem login belum siap. Muat ulang halaman.";

            console.error(
                "Supabase Auth tidak tersedia."
            );

            setAuthError(message);

            showToast(
                message,
                "error"
            );

            return;
        }

        setLoading(true);

        try {
            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({
                        email:
                            cleanEmail,

                        password
                    });

            if (error) {
                throw error;
            }

            if (!data?.user) {
                throw new Error(
                    "Login tidak menghasilkan data pengguna."
                );
            }

            onUserChange(
                data.user
            );

            setShowLogin(false);

            setPassword("");

            setAuthError("");

            showToast(
                "Berhasil masuk.",
                "success"
            );

        } catch (error) {

            console.error(
                "Gagal masuk:",
                error
            );

            let message =
                error?.message ||
                "Gagal masuk. Coba lagi.";

            if (
                /invalid login credentials/i.test(
                    message
                )
            ) {
                message =
                    "Email atau password salah.";
            }

            if (
                /email not confirmed/i.test(
                    message
                )
            ) {
                message =
                    "Email belum dikonfirmasi. Cek email terlebih dahulu.";
            }

            setAuthError(
                message
            );

            showToast(
                message,
                "error"
            );

        } finally {
            setLoading(false);
        }
    }


    async function signUp() {

        if (loading) {
            return;
        }

        setAuthError("");

        const cleanEmail =
            email.trim();

        if (
            !cleanEmail ||
            !password
        ) {
            const message =
                "Isi email dan password.";

            setAuthError(message);

            showToast(
                message,
                "error"
            );

            return;
        }

        if (
            !window.supabase ||
            !supabaseClient ||
            !supabaseClient.auth
        ) {
            const message =
                "Sistem login belum siap. Muat ulang halaman.";

            console.error(
                "Supabase Auth tidak tersedia."
            );

            setAuthError(message);

            showToast(
                message,
                "error"
            );

            return;
        }

        setLoading(true);

        try {
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
                            cleanEmail,

                        password,

                        options: {
                            emailRedirectTo:
                                redirectUrl
                        }
                    });

            /*
             * Supabase bisa mengembalikan error langsung
             * ketika email sudah digunakan.
             */
            if (error) {

                const errorMessage =
                    error?.message ||
                    "";

                if (
                    /already registered/i.test(
                        errorMessage
                    ) ||
                    /user already exists/i.test(
                        errorMessage
                    ) ||
                    /email.*already/i.test(
                        errorMessage
                    ) ||
                    /already.*email/i.test(
                        errorMessage
                    )
                ) {
                    const message =
                        "Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.";

                    setAuthError(
                        message
                    );

                    /*
                     * Sengaja memakai "success" supaya
                     * tampilannya tetap sama seperti
                     * kotak oranye informasi akun berhasil
                     * dibuat sebelumnya.
                     */
                    showToast(
                        message,
                        "success"
                    );

                    return;
                }

                throw error;
            }


            /*
             * Supabase juga dapat menyembunyikan keberadaan
             * akun lama demi alasan keamanan. Pada kondisi
             * tertentu, user dikembalikan tetapi identities
             * kosong. Ini menandakan email tersebut sudah
             * memiliki akun.
             */
            if (
                data?.user &&
                Array.isArray(
                    data.user.identities
                ) &&
                data.user.identities.length === 0
            ) {
                const message =
                    "Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.";

                setAuthError(
                    message
                );

                showToast(
                    message,
                    "success"
                );

                return;
            }


            /*
             * Jika langsung mendapatkan session,
             * berarti akun berhasil dibuat sekaligus
             * masuk tanpa perlu konfirmasi email.
             */
            if (
                data?.session &&
                data?.user
            ) {
                onUserChange(
                    data.user
                );

                setShowLogin(false);

                setPassword("");

                setAuthError("");

                showToast(
                    "Akun berhasil dibuat dan kamu sudah masuk.",
                    "success"
                );

                return;
            }


            /*
             * Akun baru berhasil dibuat tetapi session
             * belum tersedia karena perlu konfirmasi email.
             */
            const message =
                "Akun berhasil dibuat. Cek email untuk konfirmasi.";

            setAuthError(
                message
            );

            showToast(
                message,
                "success"
            );

        } catch (error) {

            console.error(
                "Gagal daftar:",
                error
            );

            let message =
                error?.message ||
                "Gagal membuat akun. Coba lagi.";

            /*
             * Jaga-jaga apabila Supabase mengembalikan
             * variasi pesan duplicate-email yang berbeda.
             */
            if (
                /already registered/i.test(
                    message
                ) ||
                /user already exists/i.test(
                    message
                ) ||
                /email.*already/i.test(
                    message
                ) ||
                /already.*email/i.test(
                    message
                )
            ) {
                message =
                    "Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.";

                setAuthError(
                    message
                );

                showToast(
                    message,
                    "success"
                );

                return;
            }

            setAuthError(
                message
            );

            showToast(
                message,
                "error"
            );

        } finally {
            setLoading(false);
        }
    }


    async function signOut() {
        try {
            const {
                error
            } =
                await supabaseClient.auth.signOut();

            if (error) {
                throw error;
            }

            onUserChange(null);

            showToast(
                "Berhasil keluar.",
                "success"
            );

        } catch (error) {

            console.error(
                "Gagal keluar:",
                error
            );

            showToast(
                error?.message ||
                    "Gagal keluar. Coba lagi.",
                "error"
            );
        }
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
                    type="button"
                    className="auth-button"
                    onClick={signOut}
                >
                    Keluar
                </button>

            </div>
        );
    }


    return (
        <>
            <button
                type="button"
                className="auth-button login-trigger"
                onClick={openLogin}
            >
                Masuk
            </button>


            {showLogin && (

                <div
                    className="login-modal-backdrop"
                    style={{
                        zIndex: 9990
                    }}
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeLogin();
                        }

                    }}
                >

                    <div
                        className="login-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Masuk ke ArunikaMix"
                        style={{
                            padding:
                                "28px"
                        }}
                    >

                        <div
                            className="login-form-row"
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "stretch",
                                gap:
                                    "10px",
                                width:
                                    "100%"
                            }}
                        >

                            <button
                                type="button"
                                className="login-modal-close"
                                style={{
                                    position:
                                        "static",
                                    flex:
                                        "0 0 42px",
                                    alignSelf:
                                        "stretch"
                                }}
                                onClick={closeLogin}
                                aria-label="Tutup"
                                disabled={loading}
                            >
                                <Icon
                                    name="x"
                                    size={17}
                                />
                            </button>


                            <div
                                className="auth-fields"
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    gap:
                                        "10px",
                                    width:
                                        "100%",
                                    flex:
                                        "1"
                                }}
                            >

                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    autoComplete="email"
                                    aria-label="Email"
                                    onChange={e => {
                                        setEmail(
                                            e.target.value
                                        );
                                        clearAuthError();
                                    }}
                                    style={{
                                        width:
                                            "100%",
                                        boxSizing:
                                            "border-box"
                                    }}
                                />


                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    autoComplete="current-password"
                                    aria-label="Password"
                                    onChange={e => {
                                        setPassword(
                                            e.target.value
                                        );
                                        clearAuthError();
                                    }}
                                    onKeyDown={event => {

                                        if (
                                            event.key ===
                                            "Enter"
                                        ) {
                                            event.preventDefault();

                                            if (!loading) {
                                                signIn();
                                            }
                                        }

                                    }}
                                    style={{
                                        width:
                                            "100%",
                                        boxSizing:
                                            "border-box"
                                    }}
                                />

                            </div>

                        </div>


                        {authError && (

                            <div
                                className="auth-error-message"
                                role="alert"
                            >
                                {authError}
                            </div>

                        )}


                        <div
                            className="auth-actions"
                            style={{
                                marginTop:
                                    "12px"
                            }}
                        >

                            <button
                                type="button"
                                className="auth-button modal-primary"
                                onClick={signIn}
                                disabled={loading}
                            >
                                {loading
                                    ? "Memproses..."
                                    : "Masuk"}
                            </button>

                            <button
                                type="button"
                                className="auth-button secondary modal-secondary"
                                onClick={signUp}
                                disabled={loading}
                            >
                                {loading
                                    ? "Memproses..."
                                    : "Daftar akun"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}


/* =========================================================
   DESIGN OVERRIDES
========================================================= */

function DesignOverrides() {
    return (
        <style>
            {`
                /*
                 * Override kecil untuk menjaga tampilan
                 * tetap seperti desain editorial ArunikaMix.
                 */

                .attendance-panel {
                    box-sizing: border-box;
                }

                .attendance-input {
                    box-sizing: border-box;
                }

                .attendance-input textarea {
                    width: 100% !important;
                    box-sizing: border-box !important;
                    min-height: 118px;
                    resize: vertical;
                }

                .add-member-button {
                    width: 100% !important;
                }

                .group-count-field {
                    width: 100%;
                }

                .group-count-input-wrap {
                    overflow: hidden;
                }

                .group-count-input {
                    appearance: textfield;
                }

                .group-count-input::-webkit-outer-spin-button,
                .group-count-input::-webkit-inner-spin-button {
                    appearance: none;
                    margin: 0;
                }

                .group-count-input:focus {
                    outline: none;
                }

                .history-section {
                    overflow: hidden;
                }

                .history-toggle {
                    width: 100%;
                    box-sizing: border-box;
                }

                .history-body {
                    box-sizing: border-box;
                }

                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }

                .history-item {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    min-height: 54px;
                    padding: 9px 12px;
                    box-sizing: border-box;
                    border: 1px solid var(--line);
                    border-radius: 9px;
                    cursor: pointer;
                    transition:
                        transform .18s ease,
                        border-color .18s ease,
                        background .18s ease;
                }

                .history-item:hover {
                    transform: translateY(-1px);
                    border-color: var(--coral);
                }

                .history-item:focus-visible {
                    outline: 2px solid var(--coral);
                    outline-offset: 2px;
                }

                .history-item-content {
                    min-width: 0;
                    flex: 1;
                }

                .history-item-title {
                    font-weight: 600;
                    line-height: 1.2;
                }

                .history-item-date {
                    margin-top: 2px;
                    font-size: 10px;
                }

                .history-item-preview {
                    display: none;
                }

                .history-item-delete {
                    flex: 0 0 auto;
                    cursor: pointer;
                }

                .hero-stamp {
                    display: flex;
                    align-items: baseline;
                    gap: 9px;
                }

                .stamp-number {
                    color: var(--coral);
                }

                .stamp-label {
                    color: var(--ink);
                }


                /* =================================================
                   QUEUE
                ================================================= */

                .queue-item-content {
                    min-width: 0 !important;
                    flex: 1 1 auto !important;
                    display: flex !important;
                    align-items: flex-start !important;
                    justify-content: center !important;
                    overflow: visible !important;
                }

                .queue-name {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    color: var(--ink) !important;
                    position: relative !important;
                    z-index: 2 !important;

                    /*
                     * Semua nama berada pada satu baris.
                     */
                    white-space: nowrap !important;

                    /*
                     * Ukuran diperkecil supaya nama panjang
                     * seperti "Rasya Muhammad Athaya" tetap
                     * terasa seperti satu kalimat.
                     */
                    font-size: 14px !important;
                    line-height: 1.35 !important;

                    min-height: 0 !important;
                    overflow: visible !important;

                    font-family:
                        var(
                            --font-body,
                            "DM Sans",
                            sans-serif
                        ) !important;
                }


                /* =================================================
                   TOAST
                ================================================= */

                .toast {
                    z-index: 99999 !important;
                    pointer-events: none !important;
                }

                .toast-message {
                    color: var(--plum) !important;
                    opacity: 1 !important;
                }


                /* =================================================
                   LOGIN MODAL
                   (Position fixed & transform agar selalu di tengah)
                ================================================= */

                .login-modal-backdrop {
                    z-index: 9990 !important;
                    
                    /* Tambahan untuk memaksa modal ke tengah */
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background: rgba(48, 35, 51, 0.4) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 20px !important;
                    box-sizing: border-box !important;
                }

                .login-modal {
                    margin: 0 !important;
                    max-height: 90vh !important;
                    overflow-y: auto !important;
                    background: var(--paper-light) !important;
                    border-radius: 14px !important;
                    border: 1px solid var(--line) !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
                    width: 100% !important;
                    max-width: 340px !important;
                }

                .auth-error-message {
                    width: 100%;
                    box-sizing: border-box;
                    margin-top: 12px;
                    padding: 10px 12px;
                    border: 1px solid rgba(216, 120, 104, .38);
                    border-radius: 9px;
                    background: rgba(232, 120, 104, .10);
                    color: var(--coral-deep);
                    font-family:
                        var(
                            --font-body,
                            "DM Sans",
                            sans-serif
                        );
                    font-size: 12px;
                    line-height: 1.45;
                    overflow-wrap: anywhere;
                }

                .auth-button:disabled {
                    cursor: wait;
                }


                @media (max-width: 700px) {

                    .attendance-panel {
                        padding-left: 22px !important;
                        padding-right: 22px !important;
                    }

                    .group-count-input-wrap {
                        min-height: 62px !important;
                    }

                    .group-count-input {
                        font-size: 34px !important;
                    }

                    .history-item-preview {
                        display: none !important;
                    }

                    .queue-name {
                        font-size: 13px !important;
                    }

                }


                /* =================================================
                   AUTH TOUCH / HITBOX REPAIR — FIXED
                ================================================= */

                .login-modal-backdrop {
                    pointer-events: auto !important;
                }

                .login-modal {
                    position: relative !important;
                    pointer-events: auto !important;
                }

                .login-form-row,
                .auth-fields,
                .auth-actions {
                    pointer-events: auto !important;
                }

                .auth-button {
                    pointer-events: auto !important;
                    touch-action: manipulation !important;
                    -webkit-tap-highlight-color: transparent !important;
                    cursor: pointer;
                }

                .auth-button.modal-primary,
                .auth-button.modal-secondary {
                    width: 100%;
                    min-height: 44px;
                    position: relative;
                }

                .toast {
                    position: fixed !important;
                    z-index: 99999 !important;
                    pointer-events: none !important;
                }

                .toast-message {
                    pointer-events: none !important;
                }
            `}
        </style>
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
    ] = useState([
        ...DEFAULT_NAMES
    ]);

    const [
        selectedList,
        setSelectedList
    ] = useState(null);

    const [
        mode,
        setMode
    ] = useState("groups");

    const [
        historySelection,
        setHistorySelection
    ] = useState(null);

    const {
        toast,
        showToast
    } = useToast();


    function handleUserChange(nextUser) {
        setUser(nextUser);

        setHistorySelection(null);

        setNames([
            ...DEFAULT_NAMES
        ]);

        setSelectedList(null);

        if (!nextUser) {
            clearSessionStorage(
                STORAGE_KEYS.history
            );

            window.dispatchEvent(
                new Event(
                    "arunikamix-history-updated"
                )
            );
        }
    }


    useEffect(() => {
        let mounted = true;

        async function loadSession() {
            try {
                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.getSession();

                if (!mounted) {
                    return;
                }

                if (error) {
                    console.error(
                        "Gagal memuat sesi:",
                        error
                    );

                    return;
                }

                if (data.session?.user) {
                    handleUserChange(
                        data.session.user
                    );
                }
            } catch (error) {
                console.error(
                    "Gagal memuat sesi:",
                    error
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

                    /*
                     * Jangan reset daftar ketika Supabase
                     * hanya melakukan refresh token.
                     */
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


    function restoreHistory(item) {
        if (!item) {
            return;
        }

        if (
            Array.isArray(item.names) &&
            item.names.length
        ) {
            setNames([
                ...item.names
            ]);
        }

        setSelectedList(null);

        setMode(
            item.type
        );

        setHistorySelection(
            item
        );

        showToast(
            "Hasil riwayat dipulihkan.",
            "success"
        );
    }


    function renderMode() {

        if (mode === "groups") {
            return (
                <GroupMode
                    names={names}
                    showToast={showToast}
                    historySelection={
                        historySelection
                    }
                />
            );
        }

        if (mode === "wheel") {
            return (
                <SpinWheel
                    names={names}
                    setNames={setNames}
                    showToast={showToast}
                    historySelection={
                        historySelection
                    }
                />
            );
        }

        if (mode === "duel") {
            return (
                <DuelTool
                    names={names}
                    showToast={showToast}
                    historySelection={
                        historySelection
                    }
                />
            );
        }

        if (mode === "queue") {
            return (
                <QueueTool
                    names={names}
                    showToast={showToast}
                    historySelection={
                        historySelection
                    }
                />
            );
        }

        return null;
    }


    return (
        <div className="app">

            <DesignOverrides />


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

                    <AuthPanel
                        user={user}
                        onUserChange={
                            handleUserChange
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


                    <div
                        className="hero-stamp"
                        style={{
                            justifyContent:
                                "flex-end",
                            whiteSpace:
                                "nowrap"
                        }}
                    >

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
                    onSelectHistory={
                        restoreHistory
                    }
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
