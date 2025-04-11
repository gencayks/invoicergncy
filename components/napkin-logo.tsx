export default function NapkinLogo() {
  return (
    <div className="flex items-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
        <path d="M10 30L30 10" stroke="black" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 10L30 30" stroke="black" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.2" />
      </svg>
      <span className="font-serif text-xl">Napkin</span>
    </div>
  )
}
