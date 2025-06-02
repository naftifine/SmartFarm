
export const OnOffButton = () => {
   const toggleSwitch = (input: HTMLInputElement) => {
   const label = input.nextElementSibling as HTMLElement;
   const text = label.querySelector("#toggleText") as HTMLElement;
   const ball = label.querySelector("#toggleBall") as HTMLElement;

   if (input.checked) {
    label.classList.add("bg-[#0E947A]");
    label.classList.remove("bg-[#E6E6E6]");
    text.textContent = "ON";
    text.classList.remove("text-black", "text-right", "pr-1.5");
    text.classList.add("text-white", "text-left", "pl-2");
    ball.style.transform = "translateX(66px)";
   } else {
    label.classList.add("bg-[#E6E6E6]");
    label.classList.remove("bg-[#0E947A]");
    text.textContent = "OFF";
    text.classList.remove("text-white", "text-left", "pl-2");
    text.classList.add("text-black", "text-right", "pr-1.5");
    ball.style.transform = "translateX(4px)";
  }
};
    return (
    <div className="flex items-center">
    <input
      type="checkbox"
      id="toggleSwitch"
      className="hidden"
      onChange={(e) => toggleSwitch(e.target)}
    />
    <label
      htmlFor="toggleSwitch"
      className="select-none relative inline-flex h-12 w-28 items-center rounded-full transition-colors duration-200 cursor-pointer bg-[#E6E6E6]"
    >
      <span
        id="toggleText"
        className="absolute w-full text-xs transition-transform duration-200 text-right pr-1.5 text-black"
      >
        OFF
      </span>
      <span
        id="toggleBall"
        className="inline-block w-[34px] h-[34px] transform rounded-full bg-white transition-transform duration-200 translate-x-1"
      ></span>
    </label>
  </div>
    )
}
