import { OnOffButton } from "../components/onoffButton"
export const Humidity = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className=" bg-white rounded-xl shadow-lg p-6 h-115 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-1">
                    <h1 className="text-center text-2xl md:text-4xl text-blue-900 pt-3 pb-6">
                        <strong>Water Pump</strong>
                    </h1>
                    <span className="flex items-center justify-center ">
                        <img src="./src/assets/fuel.svg" alt="fuel" className="w-60 h-60" />
                    </span>
                    <div className="flex items-center justify-center mt-8">
                        <OnOffButton/>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 h-75 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-2">
                    <h1 className="text-center text-2xl md:text-4xl text-blue-900 pt-3 pb-6">
                        <strong>Humidity</strong>
                    </h1>
                    <h1 className="flex text-4xl md:text-5xl text-blue-500 pt-6 ml-50">
                        <strong>20</strong>
                        <span className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-indigo-100 ml-2">
                        <svg className="h-8 w-8 text-blue-500"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <line x1="19" y1="5" x2="5" y2="19" />  <circle cx="6.5" cy="6.5" r="2.5" />  <circle cx="17.5" cy="17.5" r="2.5" /></svg>
                        </span>
                    </h1>
                    <a className="inline-block mt-8 ml-50 px-8 py-2 rounded-full text-xl font-bold text-white bg-green-300 hover:bg-green-400 transition-transform duration-300 hover:scale-105">
                        Stable
                    </a>
                </div>
        </div>
    )
}