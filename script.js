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

const DEFAULT_TEMPLATE_NAME =
    "Arunika";

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
        "arunikamix_shuffle_history_v5"

};


/* =========================================================
   STORAGE HELPERS
========================================================= */

function readStorage(
    key,
    fallback
) {

    try {

        const value =
            localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);

    } catch {

        return fallback;

    }

}


function writeStorage(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    } catch {

        // Ignore localStorage errors

    }

}


/* =========================================================
   GENERAL HELPERS
========================================================= */

function shuffleArray(
    array
) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
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


function cleanNames(
    text
) {

    return text
        .split(/\r?\n/)
        .map(
            name =>
                name.trim()
        )
        .filter(Boolean);

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
        ].slice(
            0,
            50
        );


    writeStorage(
        STORAGE_KEYS.history,
        updated
    );

}


function formatHistoryDate(
    date
) {

    try {

        return new Intl.DateTimeFormat(
            "id-ID",
            {
                dateStyle:
                    "medium",
                timeStyle:
                    "short"
            }
        ).format(
            new Date(date)
        );

    } catch {

        return "";

    }

}


function getHistoryIcon(
    type
) {

    if (
        type === "groups"
    ) {
        return "users";
    }

    if (
        type === "duel"
    ) {
        return "shuffle";
    }

    if (
        type === "queue"
    ) {
        return "list";
    }

    if (
        type === "wheel"
    ) {
        return "rotate";
    }

    return "list";

}


/* =========================================================
   SHORT WHEEL NAME
========================================================= */

function shortWheelName(
    name
) {

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        parts.length === 0
    ) {
        return "";
    }


    if (
        parts.length === 1
    ) {
        return parts[0];
    }


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


    return `${
        parts[0]
    } ${
        parts[1][0]
    }`;

}


/* =========================================================
   GROUPING
========================================================= */

function splitIntoGroups(
    names,
    groupCount
) {

    const shuffled =
        shuffleArray(
            names
        );


    const groups =
        Array.from(
            {
                length:
                    groupCount
            },
            () => []
        );


    shuffled.forEach(
        (
            name,
            index
        ) => {

            groups[
                index %
                groupCount
            ].push(
                name
            );

        }
    );


    return groups;

}


/* =========================================================
   DUEL PAIRS
========================================================= */

function makeDuelPairs(
    names
) {

    const shuffled =
        shuffleArray(
            names
        );


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

async function copyText(
    text
) {

    try {

        await navigator
            .clipboard
            .writeText(
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
        `

    };


    return (
        <span
            className="icon-wrap"
            dangerouslySetInnerHTML={{
                __html:
                    icons[name] ||
                    icons.users
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


        setTimeout(
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
            label:
                "Pembagi Kelompok",
            icon: "users"
        },

        {
            id: "wheel",
            label:
                "Roda Putar",
            icon: "rotate"
        },

        {
            id: "duel",
            label:
                "Undian Berpasangan",
            icon: "shuffle"
        },

        {
            id: "queue",
            label:
                "Urutan Antrean",
            icon: "list"
        }

    ];


    return (

        <div className="mode-navigation">

            {modes.map(
                item => (

                    <button
                        key={
                            item.id
                        }
                        className={
                            `mode-button ${
                                mode === item.id
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setMode(
                                item.id
                            )
                        }
                    >

                        <Icon
                            name={
                                item.icon
                            }
                            size={17}
                        />

                        <span>
                            {
                                item.label
                            }
                        </span>

                    </button>

                )
            )}

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


    async function loadLists() {

        if (!user) {

            setLists([]);

            return;

        }


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "attendance_lists"
                    )
                    .select("*")
                    .eq(
                        "user_id",
                        user.id
                    )
                    .order(
                        "updated_at",
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                console.error(
                    "LOAD LIST ERROR:",
                    error
                );


                if (
                    error.code ===
                        "PGRST205"
                ) {

                    showToast(
                        "Tabel attendance_lists belum dibuat di Supabase.",
                        "error"
                    );

                } else {

                    showToast(
                        "Gagal mengambil daftar tersimpan.",
                        "error"
                    );

                }


                return;

            }


            setLists(
                data || []
            );

        } catch (
            error
        ) {

            console.error(
                error
            );

            showToast(
                "Gagal mengambil daftar tersimpan.",
                "error"
            );

        }

    }


    useEffect(
        () => {

            loadLists();

        },
        [user]
    );


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


        setLoading(
            true
        );


        try {

            if (
                selectedList?.id
            ) {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from(
                            "attendance_lists"
                        )
                        .update({

                            name,

                            names,

                            updated_at:
                                new Date()
                                    .toISOString()

                        })
                        .eq(
                            "id",
                            selectedList.id
                        )
                        .eq(
                            "user_id",
                            user.id
                        )
                        .select()
                        .single();


                if (error) {
                    throw error;
                }


                setSelectedList(
                    data
                );


                showToast(
                    "Daftar berhasil diperbarui."
                );

            } else {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from(
                            "attendance_lists"
                        )
                        .insert({

                            user_id:
                                user.id,

                            name,

                            names

                        })
                        .select()
                        .single();


                if (error) {
                    throw error;
                }


                setSelectedList(
                    data
                );


                showToast(
                    "Daftar berhasil disimpan."
                );

            }


            await loadLists();

        } catch (
            error
        ) {

            console.error(
                "SAVE LIST ERROR:",
                error
            );


            if (
                error.code ===
                    "PGRST205"
            ) {

                showToast(
                    "Tabel attendance_lists belum dibuat di Supabase.",
                    "error"
                );

            } else {

                showToast(
                    error.message ||
                    "Gagal menyimpan daftar.",
                    "error"
                );

            }

        } finally {

            setLoading(
                false
            );

        }

    }


    function addNames() {

        const newNames =
            cleanNames(
                input
            );


        if (
            !newNames.length
        ) {

            showToast(
                "Masukkan minimal satu nama.",
                "error"
            );

            return;

        }


        setNames(
            previous => [
                ...previous,
                ...newNames
            ]
        );


        setInput("");


        showToast(
            `${newNames.length} nama ditambahkan.`
        );

    }


    function deleteName(
        index
    ) {

        setNames(
            previous =>
                previous.filter(
                    (
                        _,
                        i
                    ) =>
                        i !== index
                )
        );

    }


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


    async function createNewList() {

        if (!user) {

            showToast(
                "Login terlebih dahulu.",
                "error"
            );

            return;

        }


        const name =
            window.prompt(
                "Nama daftar baru:",
                "Kelas 8A"
            );


        if (
            !name?.trim()
        ) {
            return;
        }


        setLoading(
            true
        );


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "attendance_lists"
                    )
                    .insert({

                        user_id:
                            user.id,

                        name:
                            name.trim(),

                        names: []

                    })
                    .select("*")
                    .single();


            if (error) {
                throw error;
            }


            setSelectedList(
                data
            );


            setNames([]);


            await loadLists();


            showToast(
                `Daftar "${name.trim()}" berhasil dibuat.`
            );

        } catch (
            error
        ) {

            console.error(
                "CREATE LIST ERROR:",
                error
            );


            if (
                error.code ===
                    "PGRST205"
            ) {

                showToast(
                    "Tabel attendance_lists belum dibuat di Supabase.",
                    "error"
                );

            } else {

                showToast(
                    error.message ||
                    "Gagal membuat daftar.",
                    "error"
                );

            }

        } finally {

            setLoading(
                false
            );

        }

    }


    function openList(
        list
    ) {

        setSelectedList(
            list
        );


        setNames(
            Array.isArray(
                list.names
            )
                ? list.names
                : []
        );


        setShowLists(
            false
        );


        showToast(
            `Daftar "${list.name}" dibuka.`
        );

    }


    async function renameList(
        list
    ) {

        if (!user) {
            return;
        }


        const newName =
            window.prompt(
                "Nama baru:",
                list.name
            );


        if (
            !newName?.trim()
        ) {
            return;
        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "attendance_lists"
                    )
                    .update({

                        name:
                            newName.trim(),

                        updated_at:
                            new Date()
                                .toISOString()

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
                    name:
                        newName.trim()
                });

            }


            await loadLists();


            showToast(
                "Nama daftar diubah."
            );

        } catch (
            error
        ) {

            console.error(
                error
            );


            showToast(
                error.message ||
                "Gagal mengganti nama.",
                "error"
            );

        }

    }


    async function deleteList(
        list
    ) {

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
            } =
                await supabaseClient
                    .from(
                        "attendance_lists"
                    )
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

                setSelectedList(
                    null
                );

                setNames([]);

            }


            await loadLists();


            showToast(
                "Daftar berhasil dihapus."
            );

        } catch (
            error
        ) {

            console.error(
                error
            );


            showToast(
                error.message ||
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
                        onClick={
                            clearAll
                        }
                        title="Hapus semua"
                    >

                        <Icon
                            name="trash"
                            size={18}
                        />

                    </button>


                    <button
                        className="icon-button"
                        onClick={
                            resetArunika
                        }
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
                daftar nama. Setiap baris
                menjadi satu peserta.

            </p>


            <textarea
                className="name-input"
                value={input}
                onChange={e =>
                    setInput(
                        e.target.value
                    )
                }
                placeholder={
                    "Ketik atau tempel daftar nama di sini..."
                }
            />


            <button
                className="primary-button full"
                onClick={
                    addNames
                }
            >

                <Icon
                    name="plus"
                    size={18}
                />

                Tambahkan ke Daftar

            </button>


            <div className="saved-lists-section">

                <button
                    className="saved-lists-toggle"
                    onClick={() =>
                        setShowLists(
                            previous =>
                                !previous
                        )
                    }
                >

                    <span>
                        Daftar tersimpan
                    </span>


                    <span>
                        {
                            showLists
                                ? "▲"
                                : "▼"
                        }
                    </span>

                </button>


                {showLists && (

                    <div className="saved-lists">

                        <button
                            className="saved-list-new"
                            onClick={
                                createNewList
                            }
                            disabled={
                                loading ||
                                !user
                            }
                        >

                            <Icon
                                name="plus"
                                size={16}
                            />

                            Daftar Baru

                        </button>


                        {!user && (

                            <div className="login-hint">
                                Login untuk melihat
                                daftar cloud.
                            </div>

                        )}


                        {user &&
                            !lists.length && (

                                <div className="empty-saved">
                                    Belum ada daftar
                                    tersimpan.
                                </div>

                            )}


                        {lists.map(
                            list => (

                                <div
                                    className={
                                        `saved-list ${
                                            selectedList?.id ===
                                            list.id
                                                ? "selected"
                                                : ""
                                        }`
                                    }
                                    key={
                                        list.id
                                    }
                                >

                                    <button
                                        className="saved-list-main"
                                        onClick={() =>
                                            openList(
                                                list
                                            )
                                        }
                                    >

                                        <strong>
                                            {
                                                list.name
                                            }
                                        </strong>


                                        <small>

                                            {
                                                Array.isArray(
                                                    list.names
                                                )
                                                    ? list.names.length
                                                    : 0
                                            }{" "}
                                            peserta

                                        </small>

                                    </button>


                                    <button
                                        className="small-icon-button"
                                        onClick={() =>
                                            renameList(
                                                list
                                            )
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
                                            deleteList(
                                                list
                                            )
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

                )}

            </div>


            <button
                className="secondary-button full"
                onClick={
                    saveCurrentList
                }
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

                {
                    loading
                        ? "Menyimpan..."
                        : "Simpan Daftar"
                }

            </button>


            {!user && (

                <small className="login-hint">

                    Login untuk menyimpan daftar
                    ke cloud.

                </small>

            )}


            <div className="participant-list">

                {names.map(
                    (
                        name,
                        index
                    ) => (

                        <div
                            className="participant-row"
                            key={
                                `${name}-${index}`
                            }
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
                                    deleteName(
                                        index
                                    )
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
   HISTORY PANEL
========================================================= */

function HistoryPanel({
    showToast
}) {

    const [
        history,
        setHistory
    ] = useState(
        () =>
            readStorage(
                STORAGE_KEYS.history,
                []
            )
    );


    const [
        open,
        setOpen
    ] = useState(false);


    function refreshHistory() {

        setHistory(
            readStorage(
                STORAGE_KEYS.history,
                []
            )
        );

    }


    useEffect(
        () => {

            refreshHistory();


            const handler =
                () => {
                    refreshHistory();
                };


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

        },
        []
    );


    function clearHistory() {

        if (
            !history.length
        ) {
            return;
        }


        if (
            !window.confirm(
                "Hapus semua riwayat?"
            )
        ) {
            return;
        }


        writeStorage(
            STORAGE_KEYS.history,
            []
        );


        setHistory([]);


        showToast(
            "Riwayat berhasil dihapus."
        );

    }


    function deleteItem(
        id
    ) {

        const updated =
            history.filter(
                item =>
                    item.id !== id
            );


        writeStorage(
            STORAGE_KEYS.history,
            updated
        );


        setHistory(
            updated
        );

    }


    return (

        <div className="history-section">

            <button
                className="saved-lists-toggle"
                onClick={() =>
                    setOpen(
                        previous =>
                            !previous
                    )
                }
            >

                <span>
                    Riwayat Acakan
                </span>


                <span>

                    {history.length}

                    {" "}

                    {open
                        ? "▲"
                        : "▼"}

                </span>

            </button>


            {open && (

                <div className="history-list">

                    {!history.length && (

                        <div className="empty-saved">

                            Belum ada riwayat.
                            Hasil kelompok,
                            duel, dan antrean
                            akan muncul di sini.

                        </div>

                    )}


                    {history.map(
                        item => (

                            <div
                                className="history-item"
                                key={
                                    item.id
                                }
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

                                    <strong>
                                        {
                                            item.title
                                        }
                                    </strong>


                                    <small>
                                        {
                                            formatHistoryDate(
                                                item.createdAt
                                            )
                                        }
                                    </small>


                                    <div className="history-item-preview">

                                        {item.type ===
                                            "groups" &&
                                            Array.isArray(
                                                item.data
                                            ) && (

                                                <>
                                                    {
                                                        item.data
                                                            .map(
                                                                (
                                                                    group,
                                                                    index
                                                                ) =>
                                                                    `Kelompok ${
                                                                        index +
                                                                        1
                                                                    }: ${
                                                                        group.join(
                                                                            ", "
                                                                        )
                                                                    }`
                                                            )
                                                            .join(
                                                                " • "
                                                            )
                                                    }
                                                </>

                                            )}


                                        {item.type ===
                                            "duel" &&
                                            Array.isArray(
                                                item.data
                                            ) && (

                                                <>
                                                    {
                                                        item.data
                                                            .map(
                                                                (
                                                                    pair,
                                                                    index
                                                                ) =>
                                                                    `Duel ${
                                                                        index +
                                                                        1
                                                                    }: ${
                                                                        pair[0]
                                                                    } vs ${
                                                                        pair[1] ||
                                                                        "BYE"
                                                                    }`
                                                            )
                                                            .join(
                                                                " • "
                                                            )
                                                    }
                                                </>

                                            )}


                                        {item.type ===
                                            "queue" &&
                                            Array.isArray(
                                                item.data
                                            ) && (

                                                <>
                                                    {
                                                        item.data
                                                            .map(
                                                                (
                                                                    name,
                                                                    index
                                                                ) =>
                                                                    `${
                                                                        index +
                                                                        1
                                                                    }. ${
                                                                        name
                                                                    }`
                                                            )
                                                            .join(
                                                                " • "
                                                            )
                                                    }
                                                </>

                                            )}


                                        {item.type ===
                                            "wheel" && (

                                                <>
                                                    Pemenang:{" "}
                                                    {
                                                        item.data
                                                    }
                                                </>

                                            )}

                                    </div>

                                </div>


                                <button
                                    className="small-icon-button danger"
                                    onClick={() =>
                                        deleteItem(
                                            item.id
                                        )
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


                    {history.length > 0 && (

                        <button
                            className="secondary-button full"
                            onClick={
                                clearHistory
                            }
                        >

                            <Icon
                                name="trash"
                                size={16}
                            />

                            Hapus Semua Riwayat

                        </button>

                    )}

                </div>

            )}

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
        Math.min(
            4,
            names.length || 1
        )
    );


    const [
        groups,
        setGroups
    ] = useState([]);


    useEffect(
        () => {

            if (
                names.length > 0 &&
                groupCount >
                    names.length
            ) {

                setGroupCount(
                    names.length
                );

            }

        },
        [names.length]
    );


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


        setGroups(
            result
        );


        saveHistory(
            "groups",
            `${groupCount} kelompok`,
            result
        );


        window.dispatchEvent(
            new Event(
                "arunikamix-history-updated"
            )
        );


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
                    (
                        group,
                        index
                    ) =>
                        `Kelompok ${
                            index + 1
                        }\n` +
                        group
                            .map(
                                name =>
                                    `- ${name}`
                            )
                            .join(
                                "\n"
                            )
                )
                .join(
                    "\n\n"
                );


        const success =
            await copyText(
                text
            );


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
                    value={
                        groupCount
                    }
                    onChange={e =>
                        setGroupCount(
                            Number(
                                e.target.value
                            )
                        )
                    }
                    disabled={
                        !names.length
                    }
                >

                    {Array.from(
                        {
                            length:
                                names.length ||
                                1
                        },
                        (
                            _,
                            i
                        ) => (

                            <option
                                key={
                                    i + 1
                                }
                                value={
                                    i + 1
                                }
                            >

                                {
                                    i + 1
                                }{" "}
                                kelompok

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
                onClick={
                    mixGroups
                }
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
                            onClick={
                                copyGroups
                            }
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
                            (
                                group,
                                index
                            ) => (

                                <div
                                    className="group-card"
                                    key={
                                        index
                                    }
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
                                                    style={{
                                                        fontFamily:
                                                            "DM Sans, sans-serif",
                                                        fontSize:
                                                            "13px",
                                                        lineHeight:
                                                            "1.55",
                                                        color:
                                                            "var(--ink-soft)",
                                                        fontWeight:
                                                            500
                                                    }}
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


    const gradient =
        useMemo(
            () => {

                if (!total) {

                    return (
                        "conic-gradient(#ddd 0deg 360deg)"
                    );

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
                    (
                        _,
                        index
                    ) => {

                        const start =
                            index *
                            sector;


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

            },
            [
                names,
                sector,
                total
            ]
        );


    const labelFontSize =
        total <= 10
            ? 12
            : total <= 18
                ? 9
                : total <= 25
                    ? 7
                    : 5.5;


    function labelStyle(
        index
    ) {

        const center =
            index *
                sector +
            sector / 2;


        return {

            position:
                "absolute",

            left:
                "50%",

            top:
                "50%",

            width:
                "45%",

            transform:
                `rotate(${center}deg)`,

            transformOrigin:
                "0 50%",

            fontSize:
                `${labelFontSize}px`,

            lineHeight:
                "1",

            textAlign:
                "right",

            color:
                "#fff",

            fontWeight:
                700,

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


    function spin() {

        if (
            spinning ||
            !total
        ) {
            return;
        }


        setSpinning(
            true
        );


        setWinner(
            null
        );


        /*
         * PENTING:
         *
         * targetIndex adalah SATU-SATUNYA sumber
         * penentuan pemenang.
         *
         * Sektor wheel dan nama pemenang memakai
         * index yang sama.
         */

        const targetIndex =
            Math.floor(
                Math.random() *
                total
            );


        const targetName =
            names[
                targetIndex
            ];


        const targetCenter =
            targetIndex *
                sector +
            sector / 2;


        /*
         * Pointer berada di posisi -90deg.
         * Karena gradient juga dimulai dari -90deg,
         * kita menghitung target berdasarkan sektor
         * yang sama.
         */

        const targetRotation =
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
                targetRotation -
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


        setTimeout(
            () => {

                /*
                 * targetName berasal langsung dari
                 * targetIndex yang dipakai wheel.
                 */

                setWinner(
                    targetName
                );


                setSpinning(
                    false
                );


                /*
                 * Simpan history wheel juga.
                 */

                saveHistory(
                    "wheel",
                    "Roda Putar",
                    targetName
                );


                window.dispatchEvent(
                    new Event(
                        "arunikamix-history-updated"
                    )
                );


                /*
                 * Hapus pemenang jika opsi aktif.
                 */

                if (
                    removeWinner
                ) {

                    setNames(
                        previous =>
                            previous.filter(
                                (
                                    name,
                                    index
                                ) =>
                                    index !==
                                    targetIndex
                            )
                    );


                    showToast(
                        `${targetName} terpilih dan dihapus dari daftar.`
                    );

                } else {

                    showToast(
                        `Pemenang: ${targetName}`
                    );

                }

            },
            4600
        );

    }


    return (

        <div className="tool-panel">

            <div className="tool-header">

                <div>

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
                        Setiap nama memiliki
                        satu sektor yang sama
                        dengan hasil undian.
                    </p>

                </div>

            </div>


            <div className="wheel-wrapper">

                <div className="wheel-pointer">
                    ▼
                </div>


                <div
                    className="spin-wheel"
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
                        (
                            name,
                            index
                        ) => (

                            <div
                                key={
                                    `${name}-${index}`
                                }
                                className="wheel-label"
                                style={
                                    labelStyle(
                                        index
                                    )
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
                onClick={
                    spin
                }
                disabled={
                    spinning ||
                    !names.length
                }
            >

                <Icon
                    name="rotate"
                    size={18}
                />

                {
                    spinning
                        ? "Memutar..."
                        : "Putar Roda"
                }

            </button>


            <label
                style={{
                    display:
                        "flex",
                    alignItems:
                        "center",
                    gap:
                        "9px",
                    marginTop:
                        "14px",
                    fontFamily:
                        "DM Sans, sans-serif",
                    fontSize:
                        "13px",
                    color:
                        "var(--ink-soft)",
                    cursor:
                        "pointer"
                }}
            >

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
                />

                Hapus nama yang terpilih
                dari daftar

            </label>


            {removeWinner && (

                <small
                    style={{
                        display:
                            "block",
                        marginTop:
                            "7px",
                        color:
                            "var(--ink-soft)"
                    }}
                >

                    Jika aktif, nama pemenang akan
                    otomatis dihapus setelah roda
                    berhenti.

                </small>

            )}


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

        if (
            names.length < 2
        ) {

            showToast(
                "Minimal 2 peserta diperlukan.",
                "error"
            );

            return;

        }


        const result =
            makeDuelPairs(
                names
            );


        setPairs(
            result
        );


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
            "Pasangan berhasil diundi."
        );

    }


    async function copyDuel() {

        if (!pairs.length) {
            return;
        }


        const text =
            pairs
                .map(
                    (
                        pair,
                        index
                    ) =>
                        `Duel ${
                            index + 1
                        }\n${
                            pair[0]
                        } VS ${
                            pair[1] ||
                            "BYE"
                        }`
                )
                .join(
                    "\n\n"
                );


        const success =
            await copyText(
                text
            );


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
                onClick={
                    drawDuel
                }
            >

                <Icon
                    name="shuffle"
                    size={18}
                />

                Undi Pasangan

            </button>


            {pairs.length > 0 && (

                <div className="duel-results">

                    <div className="results-heading">

                        <h3>
                            Hasil pasangan
                        </h3>


                        <button
                            className="secondary-button"
                            onClick={
                                copyDuel
                            }
                        >

                            <Icon
                                name="copy"
                                size={16}
                            />

                            Salin

                        </button>

                    </div>


                    {pairs.map(
                        (
                            pair,
                            index
                        ) => (

                            <div
                                className="duel-card"
                                key={
                                    index
                                }
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
                                    {
                                        pair[1] ||
                                        "BYE"
                                    }
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


        const result =
            shuffleArray(
                names
            );


        setQueue(
            result
        );


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
                    (
                        name,
                        index
                    ) =>
                        `${index + 1}. ${name}`
                )
                .join(
                    "\n"
                );


        const success =
            await copyText(
                text
            );


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
                onClick={
                    makeQueue
                }
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
                            onClick={
                                copyQueue
                            }
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
                            (
                                name,
                                index
                            ) => (

                                <div
                                    className="queue-row"
                                    key={
                                        `${name}-${index}`
                                    }
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


        setLoading(
            true
        );


        const {
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({
                    email,
                    password
                });


        setLoading(
            false
        );


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


        if (
            password.length < 6
        ) {

            showToast(
                "Password minimal 6 karakter.",
                "error"
            );

            return;

        }


        setLoading(
            true
        );


        const redirectUrl =
            window.location.origin +
            window.location.pathname;


        const {
            error
        } =
            await supabaseClient
                .auth
                .signUp({

                    email,
                    password,

                    options: {
                        emailRedirectTo:
                            redirectUrl
                    }

                });


        setLoading(
            false
        );


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
                    onClick={
                        signOut
                    }
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


            <button
                className="primary-button"
                onClick={
                    signIn
                }
                disabled={
                    loading
                }
            >
                Masuk
            </button>


            <button
                className="secondary-button"
                onClick={
                    signUp
                }
                disabled={
                    loading
                }
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
    ] = useState(
        "groups"
    );


    const {
        toast,
        showToast
    } = useToast();


    useEffect(
        () => {

            let mounted =
                true;


            supabaseClient
                .auth
                .getSession()
                .then(
                    ({
                        data
                    }) => {

                        if (
                            !mounted
                        ) {
                            return;
                        }


                        setUser(
                            data
                                .session
                                ?.user ||
                            null
                        );

                    }
                );


            const {
                data:
                    listener
            } =
                supabaseClient
                    .auth
                    .onAuthStateChange(
                        (
                            _event,
                            session
                        ) => {

                            setUser(
                                session
                                    ?.user ||
                                null
                            );

                        }
                    );


            return () => {

                mounted =
                    false;


                listener
                    ?.subscription
                    ?.unsubscribe();

            };

        },
        []
    );


    useEffect(
        () => {

            writeStorage(
                STORAGE_KEYS.currentAttendance,
                names
            );

        },
        [names]
    );


    useEffect(
        () => {

            if (!user) {

                return;

            }


            async function loadUserLists() {

                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from(
                                "attendance_lists"
                            )
                            .select("*")
                            .eq(
                                "user_id",
                                user.id
                            )
                            .order(
                                "updated_at",
                                {
                                    ascending:
                                        false
                                }
                            );


                    if (error) {

                        console.error(
                            "USER LIST LOAD ERROR:",
                            error
                        );

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

                    } else {

                        const {
                            data:
                                created,
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


                        if (
                            createError
                        ) {

                            console.error(
                                "DEFAULT LIST ERROR:",
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

                } catch (
                    error
                ) {

                    console.error(
                        error
                    );

                }

            }


            loadUserLists();

        },
        [user]
    );


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
                    showToast={
                        showToast
                    }
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


                <ModeNavigation
                    mode={
                        mode
                    }
                    setMode={
                        setMode
                    }
                />


                <section className="workspace">

                    <AttendanceManager
                        names={
                            names
                        }
                        setNames={
                            setNames
                        }
                        user={
                            user
                        }
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


                    <div className="mode-content">

                        {mode ===
                            "groups" && (

                            <GroupMode
                                names={
                                    names
                                }
                                showToast={
                                    showToast
                                }
                            />

                        )}


                        {mode ===
                            "wheel" && (

                            <SpinWheel
                                names={
                                    names
                                }
                                setNames={
                                    setNames
                                }
                                showToast={
                                    showToast
                                }
                            />

                        )}


                        {mode ===
                            "duel" && (

                            <DuelTool
                                names={
                                    names
                                }
                                showToast={
                                    showToast
                                }
                            />

                        )}


                        {mode ===
                            "queue" && (

                            <QueueTool
                                names={
                                    names
                                }
                                showToast={
                                    showToast
                                }
                            />

                        )}

                    </div>

                </section>


                <HistoryPanel
                    showToast={
                        showToast
                    }
                />


                <footer className="site-footer">

                    <span>
                        LOKAL SAJA
                    </span>

                    <span>
                        /
                    </span>

                    <span>
                        DATA ACAKAN TERSIMPAN
                        SECARA LOKAL
                    </span>

                </footer>

            </main>


            <Toast
                toast={
                    toast
                }
            />

        </>

    );

}


/* =========================================================
   START APP
========================================================= */

const rootElement =
    document.getElementById(
        "root"
    );


if (rootElement) {

    const root =
        ReactDOM.createRoot(
            rootElement
        );


    root.render(
        React.createElement(
            App
        )
    );

        }
