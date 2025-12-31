import { Link } from "@/lib/i18n/navigation"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-gray-600">Page not found</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Go home
      </Link>
    </div>
  )
}
