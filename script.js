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
   LOCAL STORAGE
========================================================= */

const STORAGE_KEYS = {
    currentAttendance:
        "arunikamix_current_attendance_v4",

    history:
        "arunikamix_shuffle_history_v4"
};


function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);

    } catch {
        return fallback;
    }
}


function writeStorage(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    } catch {
        // Ignore storage errors
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
        .split(/\r?\n/)
        .map(name => name.trim())
        .filter(Boolean);
}


/* =========================================================
   SHORT NAME FOR WHEEL
========================================================= */

function shortWheelName(name) {

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (parts.length === 0) {
        return "";
    }

    if (parts.length === 1) {
        return parts[0];
    }


    /*
       La Ode Muhammad ...
       → La Ode M

       Wa Ode Kamalia ...
       → Wa Ode K
    */

    if (
        parts[0] === "La" &&
        parts[1] === "Ode"
    ) {

        return `La Ode ${
            parts[2]
                ? parts[2][0]
                : ""
        }`;
    }


    if (
        parts[0] === "Wa" &&
        parts[1] === "Ode"
    ) {

        return `Wa Ode ${
            parts[2]
                ? parts[2][0]
                : ""
        }`;
    }


    return `${parts[0]} ${parts[1][0]}`;
}


/* =========================================================
   GROUPING
========================================================= */

function splitIntoGroups(
    names,
    groupCount
) {

    const shuffled =
        shuffleArray(names);

    const groups =
        Array.from(
            { length: groupCount },
            () => []
        );


    /*
       Dibagi dengan metode round-robin.

       30 orang / 30 grup:
       setiap grup = 1 orang

       30 orang / 4 grup:
       8, 8, 7, 7
    */

    shuffled.forEach(
        (name, index) => {

            groups[
                index % groupCount
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

        if (
            i + 1 <
            shuffled.length
        ) {

            pairs.push([
                shuffled[i],
                shuffled[i + 1]
            ]);

        } else {

            pairs.push([
                shuffled[i],
                null
            ]);

        }
    }

    return pairs;
}


/* =========================================================
   COPY
========================================================= */

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        return true;

    } catch {

        return false;
    }
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
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        `,

        rotate: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <path d="M21 12a9 9 0 0 0-15.3-6.4L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 15.3 6.4L21 16"/>
                <path d="M21 21v-5h-5"/>
            </svg>
        `,

        shuffle: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <path d="M16 3h5v5"/>
                <path d="M4 20L21 3"/>
                <path d="M21 16v5h-5"/>
                <path d="M15 15l6 6"/>
                <path d="M4 4l5 5"/>
            </svg>
        `,

        list: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
        `,

        trash: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
            </svg>
        `,

        plus: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
        `,

        edit: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
        `,

        save: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
            </svg>
        `,

        copy: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
        `,

        link: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
        `,

        trophy: `
            <svg viewBox="0 0 24 24"
                 width="${size}"
                 height="${size}"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
                <path d="M8 21h8"/>
                <path d="M12 17v4"/>
                <path d="M7 4h10v5a5 5 0 0 1-10 0Z"/>
                <path d="M7 5H3v2a4 4 0 0 0 4 4"/>
                <path d="M17 5h4v2a4 4 0 0 1-4 4"/>
            </svg>
        `
    };


    return React.createElement(
        "span",
        {
            className: "icon-wrap",
            dangerouslySetInnerHTML: {
                __html:
                    icons[name] ||
                    icons.users
            }
        }
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

        setTimeout(() => {
            setToast(null);
        }, 2600);
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
            {toast.message}
        </div>
    );
}


/* =========================================================
   MODE NAVIGATION
========================================================= */

function ModeNavigation({
    mode,
    setMode
}) {

    const modes = [

        {
            id: "groups",
            label: "Pembagi Kelompok",
            icon: "users"
        },

        {
            id: "wheel",
            label: "Roda Putar (Spin Wheel)",
            icon: "rotate"
        },

        {
            id: "duel",
            label: "Undian Berpasangan (Duel)",
            icon: "shuffle"
        },

        {
            id: "queue",
            label: "Urutan Antrean / Giliran",
            icon: "list"
        }
    ];


    return (
        <div className="mode-navigation">

            {modes.map(item => (

                <button
                    key={item.id}
                    className={
                        `mode-button ${
                            mode === item.id
                                ? "active"
                                : ""
                        }`
                    }
                    onClick={() =>
                        setMode(item.id)
                    }
                >

                    <Icon
                        name={item.icon}
                        size={17}
                    />

                    <span>
                        {item.label}
                    </span>

                </button>

            ))}

        </div>
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
        lists,
        setLists
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        showLists,
        setShowLists
    ] = useState(false);


    /* -----------------------------------------
       Load user's saved lists
    ----------------------------------------- */

    async function loadLists() {

        if (!user) {
            setLists([]);
            return;
        }

        const {
            data,
            error
        } = await supabaseClient
            .from("attendance_lists")
            .select("*")
            .eq("user_id", user.id)
            .order(
                "updated_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(error);

            showToast(
                "Gagal mengambil daftar tersimpan.",
                "error"
            );

            return;
        }


        setLists(data || []);
    }


    useEffect(() => {

        loadLists();

    }, [user]);


    /* -----------------------------------------
       Save current list
    ----------------------------------------- */

    async function saveCurrentList() {

        if (!user) {

            showToast(
                "Login terlebih dahulu untuk menyimpan daftar.",
                "error"
            );

            return;
        }


        const name =
            selectedList?.name ||
            DEFAULT_TEMPLATE_NAME;


        setLoading(true);


        try {

            if (selectedList?.id) {

                const {
                    error
                } = await supabaseClient
                    .from("attendance_lists")
                    .update({
                        name,
                        names,
                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        selectedList.id
                    )
                    .eq(
                        "user_id",
                        user.id
                    );


                if (error) {
                    throw error;
                }


                showToast(
                    "Daftar berhasil diperbarui."
                );

            } else {

                const {
                    data,
                    error
                } = await supabaseClient
                    .from("attendance_lists")
                    .insert({
                        user_id: user.id,
                        name,
                        names
                    })
                    .select()
                    .single();


                if (error) {
                    throw error;
                }


                setSelectedList(data);


                showToast(
                    "Daftar berhasil disimpan."
                );
            }


            await loadLists();

        } catch (error) {

            console.error(error);

            showToast(
                "Gagal menyimpan daftar.",
                "error"
            );

        } finally {

            setLoading(false);
        }
    }


    /* -----------------------------------------
       Add names
    ----------------------------------------- */

    function addNames() {

        const newNames =
            cleanNames(input);


        if (!newNames.length) {

            showToast(
                "Masukkan minimal satu nama.",
                "error"
            );

            return;
        }


        setNames(prev => [
            ...prev,
            ...newNames
        ]);


        setInput("");


        showToast(
            `${newNames.length} nama ditambahkan.`
        );
    }


    /* -----------------------------------------
       Delete participant
    ----------------------------------------- */

    function deleteName(index) {

        setNames(prev =>
            prev.filter(
                (_, i) => i !== index
            )
        );
    }


    /* -----------------------------------------
       Clear all
    ----------------------------------------- */

    function clearAll() {

        if (
            !window.confirm(
                "Hapus semua peserta dari daftar ini?"
            )
        ) {
            return;
        }


        setNames([]);

        showToast(
            "Semua peserta dihapus."
        );
    }


    /* -----------------------------------------
       Reset to Arunika
    ----------------------------------------- */

    function resetArunika() {

        if (
            !window.confirm(
                "Kembalikan daftar ke template Arunika?"
            )
        ) {
            return;
        }


        setNames([
            ...DEFAULT_NAMES
        ]);


        showToast(
            "Daftar dikembalikan ke Arunika."
        );
    }


    /* -----------------------------------------
       Create new list
    ----------------------------------------- */

    async function createNewList() {
   
    if (!user) {
        showToast(
            "Login terlebih dahulu.",
            "error"
        );
        return;
    }

    const name = window.prompt(
        "Nama daftar baru:",
        "Kelas 8A"
    );

    if (!name?.trim()) {
        return;
    }

    setLoading(true);

    try {

        console.log("=== CREATE LIST START ===");
        console.log("User:", user);
        console.log("User ID:", user.id);
        console.log("Name:", name.trim());

        const insertData = {
            user_id: user.id,
            name: name.trim(),
            names: []
        };

        console.log(
            "Data yang dikirim:",
            insertData
        );

        const {
            data,
            error
        } = await supabaseClient
            .from("attendance_lists")
            .insert(insertData)
            .select("*")
            .single();

        console.log("HASIL SUPABASE:", {
            data,
            error
        });

        if (error) {
            console.error(
                "SUPABASE CREATE ERROR:",
                error
            );

            throw error;
        }

        console.log(
            "BERHASIL MEMBUAT DAFTAR:",
            data
        );

        setSelectedList(data);
        setNames([]);

        await loadLists();

        showToast(
            `Daftar "${name.trim()}" berhasil dibuat.`
        );

    } catch (error) {

        console.error(
            "CREATE LIST ERROR:",
            error
        );

        console.error(
            "MESSAGE:",
            error?.message
        );

        console.error(
            "DETAILS:",
            error?.details
        );

        console.error(
            "HINT:",
            error?.hint
        );

        console.error(
            "CODE:",
            error?.code
        );

        showToast(
            error?.message ||
            error?.details ||
            error?.hint ||
            "Gagal membuat daftar.",
            "error"
        );

    } finally {

        setLoading(false);

    }
}


    /* -----------------------------------------
       Load selected list
    ----------------------------------------- */

    function openList(list) {

        setSelectedList(list);

        setNames(
            Array.isArray(list.names)
                ? list.names
                : []
        );

        setShowLists(false);

        showToast(
            `Daftar "${list.name}" dibuka.`
        );
    }


    /* -----------------------------------------
       Rename
    ----------------------------------------- */

    async function renameList(list) {

        if (!user) {
            return;
        }


        const newName =
            window.prompt(
                "Nama baru:",
                list.name
            );


        if (!newName?.trim()) {
            return;
        }


        try {

            const {
                error
            } = await supabaseClient
                .from("attendance_lists")
                .update({
                    name: newName.trim(),
                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    list.id
                )
                .eq(
                    "user_id",
                    user.id
                );


            if (error) {
                throw error;
            }


            if (
                selectedList?.id ===
                list.id
            ) {

                setSelectedList({
                    ...list,
                    name: newName.trim()
                });
            }


            await loadLists();


            showToast(
                "Nama daftar diubah."
            );

        } catch (error) {

            console.error(error);

            showToast(
                "Gagal mengganti nama.",
                "error"
            );
        }
    }


    /* -----------------------------------------
       Delete saved list
    ----------------------------------------- */

    async function deleteList(list) {

        if (!user) {
            return;
        }


        if (
            !window.confirm(
                `Hapus daftar "${list.name}"?`
            )
        ) {
            return;
        }


        try {

            const {
                error
            } = await supabaseClient
                .from("attendance_lists")
                .delete()
                .eq(
                    "id",
                    list.id
                )
                .eq(
                    "user_id",
                    user.id
                );


            if (error) {
                throw error;
            }


            if (
                selectedList?.id ===
                list.id
            ) {

                setSelectedList(null);

                setNames([]);
            }


            await loadLists();


            showToast(
                "Daftar berhasil dihapus."
            );

        } catch (error) {

            console.error(error);

            showToast(
                "Gagal menghapus daftar.",
                "error"
            );
        }
    }


    return (
        <div className="participant-panel">

            <div className="panel-heading">

                <div>

                    <div className="eyebrow">
                        <Icon
                            name="users"
                            size={15}
                        />
                        PESERTA
                    </div>

                    <h2>
                        Daftar peserta
                        <span className="count">
                            ({names.length})
                        </span>
                    </h2>

                </div>


                <div className="panel-actions">

                    <button
                        className="icon-button"
                        onClick={clearAll}
                        title="Hapus semua"
                    >
                        <Icon
                            name="trash"
                            size={18}
                        />
                    </button>


                    <button
                        className="icon-button"
                        onClick={resetArunika}
                        title="Reset Arunika"
                    >
                        <Icon
                            name="rotate"
                            size={18}
                        />
                    </button>

                </div>

            </div>


            <p className="panel-description">
                Ketik satu nama atau tempel
                (*paste*) daftar nama panjang
                (baris baru otomatis jadi nama
                terpisah).
            </p>


            {/* INPUT */}

            <textarea
                className="name-input"
                value={input}
                onChange={e =>
                    setInput(e.target.value)
                }
                placeholder={
                    "Ketik atau tempel daftar nama di sini..."
                }
            />


            <button
                className="primary-button full"
                onClick={addNames}
            >
                <Icon
                    name="plus"
                    size={18}
                />

                Tambahkan ke Daftar
            </button>


            {/* SAVED LISTS */}

            <div className="saved-lists-section">

                <button
                    className="saved-lists-toggle"
                    onClick={() =>
                        setShowLists(
                            !showLists
                        )
                    }
                >

                    <span>
                        Daftar tersimpan
                    </span>

                    <span>
                        {showLists
                            ? "▲"
                            : "▼"}
                    </span>

                </button>


                {showLists && (

                    <div className="saved-lists">

                        <button
                            className="saved-list-new"
                            onClick={createNewList}
                        >
                            <Icon
                                name="plus"
                                size={16}
                            />
                            Daftar Baru
                        </button>


                        {!lists.length && (

                            <div className="empty-saved">
                                Belum ada daftar tersimpan.
                            </div>

                        )}


                        {lists.map(list => (

                            <div
                                className={
                                    `saved-list ${
                                        selectedList?.id === list.id
                                            ? "selected"
                                            : ""
                                    }`
                                }
                                key={list.id}
                            >

                                <button
                                    className="saved-list-main"
                                    onClick={() =>
                                        openList(list)
                                    }
                                >

                                    <strong>
                                        {list.name}
                                    </strong>

                                    <small>
                                        {
                                            Array.isArray(list.names)
                                                ? list.names.length
                                                : 0
                                        } peserta
                                    </small>

                                </button>


                                <button
                                    className="small-icon-button"
                                    onClick={() =>
                                        renameList(list)
                                    }
                                >
                                    <Icon
                                        name="edit"
                                        size={15}
                                    />
                                </button>


                                <button
                                    className="small-icon-button danger"
                                    onClick={() =>
                                        deleteList(list)
                                    }
                                >
                                    <Icon
                                        name="trash"
                                        size={15}
                                    />
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* SAVE */}

            <button
                className="secondary-button full"
                onClick={saveCurrentList}
                disabled={
                    loading ||
                    !user ||
                    names.length === 0
                }
            >

                <Icon
                    name="save"
                    size={17}
                />

                {loading
                    ? "Menyimpan..."
                    : "Simpan Daftar"}

            </button>


            {!user && (

                <small className="login-hint">
                    Login untuk menyimpan daftar
                    ke akunmu.
                </small>

            )}


            {/* PARTICIPANTS */}

            <div className="participant-list">

                {names.map(
                    (name, index) => (

                        <div
                            className="participant-row"
                            key={`${name}-${index}`}
                        >

                            <span className="participant-number">
                                {index + 1}
                            </span>

                            <span className="participant-name">
                                {name}
                            </span>

                            <button
                                className="small-icon-button danger"
                                onClick={() =>
                                    deleteName(index)
                                }
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

        </div>
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
        Math.min(4, names.length || 1)
    );


    const [
        groups,
        setGroups
    ] = useState([]);


    useEffect(() => {

        if (
            names.length > 0 &&
            groupCount > names.length
        ) {

            setGroupCount(
                names.length
            );
        }

    }, [names.length]);


    function mixGroups() {

        if (!names.length) {

            showToast(
                "Tambahkan peserta terlebih dahulu.",
                "error"
            );

            return;
        }


        const result =
            splitIntoGroups(
                names,
                groupCount
            );


        setGroups(result);

        showToast(
            `${groupCount} kelompok berhasil dibuat.`
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
                        `Kelompok ${
                            index + 1
                        }\n` +
                        group
                            .map(
                                name =>
                                    `- ${name}`
                            )
                            .join("\n")
                )
                .join("\n\n");


        const success =
            await copyText(text);


        showToast(
            success
                ? "Hasil berhasil disalin."
                : "Gagal menyalin.",
            success
                ? "default"
                : "error"
        );
    }


    return (
        <div className="tool-panel">

            <div className="tool-header">

                <div>

                    <div className="eyebrow">
                        <Icon
                            name="users"
                            size={15}
                        />
                        PEMBAGI KELOMPOK
                    </div>

                    <h2>
                        Bagi peserta secara adil
                    </h2>

                </div>

            </div>


            <div className="group-control">

                <label>
                    Jumlah kelompok
                </label>

                <select
                    value={groupCount}
                    onChange={e =>
                        setGroupCount(
                            Number(e.target.value)
                        )
                    }
                    disabled={!names.length}
                >

                    {Array.from(
                        {
                            length:
                                names.length || 1
                        },
                        (_, i) => (

                            <option
                                key={i + 1}
                                value={i + 1}
                            >
                                {i + 1} kelompok
                            </option>

                        )
                    )}

                </select>

                <small>
                    Maksimal{" "}
                    {names.length}{" "}
                    kelompok untuk{" "}
                    {names.length}{" "}
                    peserta.
                </small>

            </div>


            <button
                className="primary-button full"
                onClick={mixGroups}
            >

                <Icon
                    name="shuffle"
                    size={18}
                />

                Acak & Bagi Kelompok

            </button>


            {groups.length > 0 && (

                <div className="groups-results">

                    <div className="results-heading">

                        <h3>
                            Hasil pembagian
                        </h3>

                        <button
                            className="secondary-button"
                            onClick={copyGroups}
                        >
                            <Icon
                                name="copy"
                                size={16}
                            />
                            Salin
                        </button>

                    </div>


                    <div className="groups-grid">

                        {groups.map(
                            (group, index) => (

                                <div
                                    className="group-card"
                                    key={index}
                                    style={{
                                        borderTop:
                                            `5px solid ${
                                                GROUP_COLORS[
                                                    index %
                                                    GROUP_COLORS.length
                                                ]
                                            }`
                                    }}
                                >

                                    <h4>
                                        Kelompok{" "}
                                        {index + 1}
                                    </h4>

                                    <ol>

                                        {group.map(
                                            (
                                                name,
                                                i
                                            ) => (

                                                <li
                                                    key={
                                                        `${name}-${i}`
                                                    }
                                                >
                                                    {name}
                                                </li>

                                            )
                                        )}

                                    </ol>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}


/* =========================================================
   REAL SPIN WHEEL
========================================================= */

function SpinWheel({
    names,
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


    const total =
        names.length;


    /*
       Setiap peserta mendapat SATU sektor.
       Urutannya tidak pernah berubah selama
       wheel dibuat.

       Ini penting untuk menghindari bug:
       "yang terlihat Wa Ode I tapi hasil Ainul".
    */

    const sector =
        total > 0
            ? 360 / total
            : 360;


    const gradient = useMemo(() => {

        if (!total) {
            return "conic-gradient(#ddd 0deg 360deg)";
        }


        const colors = [
            "#e87868",
            "#e8b34d",
            "#76a99a",
            "#4b304d",
            "#86abb4",
            "#d78b88",
            "#93b99d",
            "#ba8850"
        ];


        const stops = [];


        names.forEach(
            (_, index) => {

                const start =
                    index * sector;

                const end =
                    (index + 1) *
                    sector;

                const color =
                    colors[
                        index %
                        colors.length
                    ];


                stops.push(
                    `${color} ${start}deg ${end}deg`
                );
            }
        );


        return `
            conic-gradient(
                from -90deg,
                ${stops.join(",")}
            )
        `;

    }, [
        names,
        sector,
        total
    ]);


    /*
       Ukuran teks menyesuaikan jumlah peserta.
    */

    const labelFontSize =
        total <= 10
            ? 12
            : total <= 18
                ? 9
                : total <= 25
                    ? 7
                    : 5.5;


    /*
       Posisi label.

       Kita letakkan label di tengah wheel,
       kemudian putar berdasarkan sektor.

       Karena transform dan pointer harus
       menggunakan acuan yang sama,
       index label = index peserta.
    */

    function labelStyle(index) {

        const center =
            index * sector +
            sector / 2;


        return {
            position: "absolute",

            left: "50%",
            top: "50%",

            width: "48%",

            transform:
                `rotate(${center}deg)
                 translateX(4%)`,

            transformOrigin:
                "0 50%",

            fontSize:
                `${labelFontSize}px`,

            lineHeight: "1",

            textAlign: "right",

            color: "#fff",

            fontWeight: 700,

            textShadow:
                "0 1px 2px rgba(0,0,0,.45)",

            whiteSpace:
                "nowrap",

            overflow:
                "hidden",

            textOverflow:
                "ellipsis",

            pointerEvents:
                "none"
        };
    }


    /*
       Cari index peserta berdasarkan posisi
       pointer.

       Wheel menggunakan:

       conic-gradient(from -90deg)

       Pointer berada di posisi atas.

       Karena wheel diputar dengan CSS,
       arah sektor terhadap pointer adalah
       kebalikan dari rotation.
    */

    function calculateWinnerIndex(
        finalRotation
    ) {

        if (!total) {
            return -1;
        }


        const normalized =
            (
                finalRotation % 360 +
                360
            ) % 360;


        /*
           Pointer berada di -90deg.

           Dengan gradient yang dimulai
           dari -90deg, sektor pertama
           tepat dimulai dari pointer.

           Kita cari posisi lokal sektor
           terhadap titik awal tersebut.
        */

        const localAngle =
            (
                -normalized +
                360
            ) % 360;


        let index =
            Math.floor(
                localAngle / sector
            );


        /*
           Pengaman floating point
        */

        if (
            index < 0
        ) {
            index = 0;
        }


        if (
            index >= total
        ) {
            index = total - 1;
        }


        return index;
    }


    function spin() {

        if (
            spinning ||
            !total
        ) {
            return;
        }


        setSpinning(true);

        setWinner(null);


        /*
           Random sektor target.

           Kita sengaja menentukan index
           terlebih dahulu, kemudian menghitung
           rotasi yang membuat sektor tersebut
           berada di pointer.

           Jadi pemenang ditentukan oleh
           sektor roda, bukan random terpisah.
        */

        const targetIndex =
            Math.floor(
                Math.random() * total
            );


        /*
           Target sudut tengah sektor.
        */

        const targetCenter =
            targetIndex * sector +
            sector / 2;


        /*
           Kita ingin targetCenter berada
           tepat di posisi awal pointer.

           Karena pointer berada di 0deg
           setelah normalisasi gradient,
           roda harus bergerak sebesar:

           360 - targetCenter
        */

        const targetNormalized =
            (
                360 -
                targetCenter
            ) % 360;


        const currentNormalized =
            (
                rotation % 360 +
                360
            ) % 360;


        const delta =
            (
                targetNormalized -
                currentNormalized +
                360
            ) % 360;


        const extraTurns =
            5 +
            Math.floor(
                Math.random() * 3
            );


        const finalRotation =
            rotation +
            extraTurns * 360 +
            delta;


        setRotation(
            finalRotation
        );


        setTimeout(() => {

            /*
               Karena targetIndex sudah
               ditentukan berdasarkan sektor
               yang diputar, kita gunakan target
               yang sama sebagai hasil.

               Tidak ada random kedua.
            */

            const selected =
                names[targetIndex];


            setWinner(selected);

            setSpinning(false);


            showToast(
                `Pemenang: ${selected}`
            );

        }, 4600);
    }


    return (
        <div className="wheel-panel">

            <div className="wheel-header">

                <div className="eyebrow">
                    <Icon
                        name="rotate"
                        size={15}
                    />
                    RODA PUTAR
                </div>

                <h2>
                    Putar Nama Peserta
                </h2>

                <p>
                    Nama tercantum di roda
                    dan siap diundi.
                </p>

            </div>


            <div className="wheel-wrapper">

                <div className="wheel-pointer">
                    ▼
                </div>


                <div
                    className={
                        `spin-wheel ${
                            spinning
                                ? "spinning"
                                : ""
                        }`
                    }
                    style={{
                        background:
                            gradient,

                        transform:
                            `rotate(${rotation}deg)`,

                        transition:
                            spinning
                                ? "transform 4.6s cubic-bezier(.12,.7,.18,1)"
                                : "none"
                    }}
                >

                    {names.map(
                        (name, index) => (

                            <div
                                key={
                                    `${name}-${index}`
                                }
                                className="wheel-label"
                                style={
                                    labelStyle(index)
                                }
                            >
                                {
                                    shortWheelName(
                                        name
                                    )
                                }
                            </div>

                        )
                    )}


                    <div className="wheel-center">
                        ◉
                    </div>

                </div>

            </div>


            <button
                className="primary-button full"
                onClick={spin}
                disabled={
                    spinning ||
                    !names.length
                }
            >

                <Icon
                    name="rotate"
                    size={18}
                />

                {spinning
                    ? "Memutar..."
                    : "Putar Roda"}

            </button>


            {winner && (

                <div className="winner-box">

                    🎉 Pemenang:{" "}

                    <strong>
                        {winner}
                    </strong>

                </div>

            )}

        </div>
    );
}


/* =========================================================
   DUEL
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
                "Minimal 2 peserta diperlukan.",
                "error"
            );

            return;
        }


        setPairs(
            makeDuelPairs(names)
        );

        showToast(
            "Pasangan berhasil diundi."
        );
    }


    return (
        <div className="tool-panel">

            <div className="eyebrow">
                <Icon
                    name="shuffle"
                    size={15}
                />
                UNDIAN BERPASANGAN
            </div>


            <h2>
                Duel Antar Peserta
            </h2>


            <p className="panel-description">
                Peserta diacak menjadi pasangan
                secara otomatis.
            </p>


            <button
                className="primary-button"
                onClick={drawDuel}
            >

                <Icon
                    name="shuffle"
                    size={18}
                />

                Undi Pasangan

            </button>


            {pairs.length > 0 && (

                <div className="duel-results">

                    {pairs.map(
                        (pair, index) => (

                            <div
                                className="duel-card"
                                key={index}
                            >

                                <span>
                                    Duel{" "}
                                    {index + 1}
                                </span>

                                <strong>
                                    {pair[0]}
                                </strong>

                                <div>
                                    VS
                                </div>

                                <strong>
                                    {pair[1] ||
                                        "BYE"}
                                </strong>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
}


/* =========================================================
   QUEUE
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
                "Tambahkan peserta terlebih dahulu.",
                "error"
            );

            return;
        }


        setQueue(
            shuffleArray(names)
        );


        showToast(
            "Urutan antrean dibuat."
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
                ? "Urutan berhasil disalin."
                : "Gagal menyalin.",
            success
                ? "default"
                : "error"
        );
    }


    return (
        <div className="tool-panel">

            <div className="eyebrow">
                <Icon
                    name="list"
                    size={15}
                />
                URUTAN ANTREAN / GILIRAN
            </div>


            <h2>
                Acak urutan peserta
            </h2>


            <p className="panel-description">
                Buat urutan giliran baru
                tanpa mengubah daftar peserta.
            </p>


            <button
                className="primary-button"
                onClick={makeQueue}
            >

                <Icon
                    name="shuffle"
                    size={18}
                />

                Buat Urutan

            </button>


            {queue.length > 0 && (

                <div className="queue-results">

                    <div className="results-heading">

                        <h3>
                            Urutan Giliran
                        </h3>

                        <button
                            className="secondary-button"
                            onClick={copyQueue}
                        >
                            <Icon
                                name="copy"
                                size={16}
                            />
                            Salin
                        </button>

                    </div>


                    <div className="queue-list">

                        {queue.map(
                            (name, index) => (

                                <div
                                    className="queue-row"
                                    key={`${name}-${index}`}
                                >

                                    <span>
                                        {index + 1}
                                    </span>

                                    <strong>
                                        {name}
                                    </strong>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}


/* =========================================================
   AUTH
========================================================= */

function AuthPanel({
    user,
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
            !email ||
            !password
        ) {

            showToast(
                "Masukkan email dan password.",
                "error"
            );

            return;
        }


        setLoading(true);


        const {
            error
        } = await supabaseClient
            .auth
            .signInWithPassword({
                email,
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


        showToast(
            "Berhasil masuk."
        );
    }


    async function signUp() {

        if (
            !email ||
            !password
        ) {

            showToast(
                "Masukkan email dan password.",
                "error"
            );

            return;
        }


        if (password.length < 6) {

            showToast(
                "Password minimal 6 karakter.",
                "error"
            );

            return;
        }


        setLoading(true);


        const redirectUrl =
            window.location.origin +
            window.location.pathname;


        const {
            error
        } = await supabaseClient
            .auth
            .signUp({

                email,
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


        showToast(
            "Akun dibuat. Cek email untuk konfirmasi."
        );
    }


    async function signOut() {

        await supabaseClient
            .auth
            .signOut();


        showToast(
            "Berhasil keluar."
        );
    }


    if (user) {

        return (
            <div className="auth-box logged-in">

                <span>
                    {user.email}
                </span>

                <button
                    className="secondary-button"
                    onClick={signOut}
                >
                    Keluar
                </button>

            </div>
        );
    }


    return (
        <div className="auth-box">

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e =>
                    setEmail(e.target.value)
                }
            />


            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e =>
                    setPassword(e.target.value)
                }
            />


            <button
                className="primary-button"
                onClick={signIn}
                disabled={loading}
            >
                Masuk
            </button>


            <button
                className="secondary-button"
                onClick={signUp}
                disabled={loading}
            >
                Daftar
            </button>

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
    ] = useState(
        () =>
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


    /* -----------------------------------------
       Auth
    ----------------------------------------- */

    useEffect(() => {

        let mounted = true;


        supabaseClient
            .auth
            .getSession()
            .then(({
                data
            }) => {

                if (!mounted) {
                    return;
                }

                setUser(
                    data.session?.user ||
                    null
                );

            });


        const {
            data: listener
        } =
            supabaseClient
                .auth
                .onAuthStateChange(
                    (
                        _event,
                        session
                    ) => {

                        setUser(
                            session?.user ||
                            null
                        );

                    }
                );


        return () => {

            mounted = false;

            listener
                ?.subscription
                ?.unsubscribe();

        };

    }, []);


    /* -----------------------------------------
       Local current names backup
    ----------------------------------------- */

    useEffect(() => {

        writeStorage(
            STORAGE_KEYS.currentAttendance,
            names
        );

    }, [names]);


    /* -----------------------------------------
       Create Arunika for first account login
    ----------------------------------------- */

    useEffect(() => {

        if (!user) {
            return;
        }


        async function ensureArunika() {

            const {
                data,
                error
            } = await supabaseClient
                .from("attendance_lists")
                .select("id")
                .eq(
                    "user_id",
                    user.id
                )
                .limit(1);


            if (error) {

                console.error(error);

                return;
            }


            /*
               Kalau akun belum punya
               daftar sama sekali,
               buat template Arunika.
            */

            if (
                !data ||
                data.length === 0
            ) {

                const {
                    data: created,
                    error:
                        createError
                } =
                    await supabaseClient
                        .from(
                            "attendance_lists"
                        )
                        .insert({
                            user_id:
                                user.id,

                            name:
                                DEFAULT_TEMPLATE_NAME,

                            names:
                                DEFAULT_NAMES
                        })
                        .select()
                        .single();


                if (createError) {

                    console.error(
                        createError
                    );

                    return;
                }


                setSelectedList(
                    created
                );


                setNames([
                    ...DEFAULT_NAMES
                ]);
            }
        }


        ensureArunika();

    }, [user]);


    return (
        <>

            <header className="site-header">

                <div className="brand">

                    <div className="brand-mark">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div>
                        <strong>
                            ArunikaMix
                        </strong>

                        <small>
                            PEMBAGI KELOMPOK ACAK
                            & MINI GAMES
                        </small>
                    </div>

                </div>


                <AuthPanel
                    user={user}
                    showToast={showToast}
                />

            </header>


            <main className="app-shell">

                <section className="hero">

                    <div>

                        <div className="eyebrow">
                            ARUNIKA
                        </div>

                        <h1>
                            Pembagi kelompok
                            <br />
                            & mini games.
                        </h1>

                        <p>
                            Beri ruang untuk kejutan.
                        </p>

                    </div>

                </section>


                {/* MODE */}

                <ModeNavigation
                    mode={mode}
                    setMode={setMode}
                />


                {/* WORKSPACE */}

                <section className="workspace">

                    <AttendanceManager
                        names={names}
                        setNames={setNames}
                        user={user}
                        selectedList={selectedList}
                        setSelectedList={
                            setSelectedList
                        }
                        showToast={showToast}
                    />


                    <div className="mode-content">

                        {mode === "groups" && (

                            <GroupMode
                                names={names}
                                showToast={
                                    showToast
                                }
                            />

                        )}


                        {mode === "wheel" && (

                            <SpinWheel
                                names={names}
                                showToast={
                                    showToast
                                }
                            />

                        )}


                        {mode === "duel" && (

                            <DuelTool
                                names={names}
                                showToast={
                                    showToast
                                }
                            />

                        )}


                        {mode === "queue" && (

                            <QueueTool
                                names={names}
                                showToast={
                                    showToast
                                }
                            />

                        )}

                    </div>

                </section>


                <footer className="site-footer">

                    <span>
                        LOKAL SAJA
                    </span>

                    <span>
                        /
                    </span>

                    <span>
                        TANPA LOGIN UNTUK
                        MENGACAK
                    </span>

                </footer>

            </main>


            <Toast
                toast={toast}
            />

        </>
    );
}


/* =========================================================
   START
========================================================= */

const rootElement =
    document.getElementById("root");


if (rootElement) {

    const root =
        ReactDOM.createRoot(
            rootElement
        );

    root.render(
        React.createElement(App)
    );
                    }
