import { Link } from 'react-router-dom'


// work ofr dasktop and phone
function Navbar() {
    return (
        <nav className="bg-black border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center">

            {/* logo - on the left */}
            <Link
                to="/"
                className="text-lg md:text-xl font-medium text-[#FDB813] hover:text-[#FDB813]/80 transition-colors"
            >
                ReelPhrases
            </Link>


            {/* nav links - on the right */}
            {/* search */}
            <div className="flex gap-4 md:gap-8 items-center">
                <Link
                    to="/search"
                    className="text-xs md:text-sm text-white hover:text-[#FDB813] transition-colors"
                >
                    Search
                </Link>

                {/* recognition */}
                <Link
                    to="/recognition"
                    className="text-xs md:text-sm text-white hover:text-[#FDB813] transition-colors"
                >
                    Recognition
                </Link>

            </div>
        </nav>
    )
}

export default Navbar