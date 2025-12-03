import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-gentle"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-gentle"></div>
      </div>

      {/* Main content container with fade-in animation */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl animate-fade-in-up">
        <header className="py-6">
          <h1 className="text-3xl font-bold text-center text-yellow-500 animate-fade-in-down">AI Marketing Buddy</h1>
        </header>

        <main className="py-12">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-neutral-200 mb-4 animate-fade-in">
              Bantu UMKM buat konten marketing berkualitas dalam hitungan detik
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto animate-fade-in-delay-100">
              Platform sederhana untuk membantu pelaku usaha mikro kecil dan menengah membuat konten pemasaran yang menarik di media sosial dan marketplace sehingga pelaku usaha dapat fokus mengembangkan bisnisnya (dan scroll fesnuk).
            </p>
          </div>

          <div className="flex justify-center mb-16 animate-fade-in-up-delay-200">
            <Link href="/generator-v2">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-neutral-900 text-lg px-8 py-6 shadow-lg shadow-yellow-500/20 transition-all hover:shadow-yellow-500/40 animate-fade-in-scale">
                Mulai Sekarang
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              title="Generate Caption"
              description="Buat caption menarik untuk Instagram, TikTok, dan platform lainnya"
            />
            <FeatureCard
              title="Deskripsi Produk"
              description="Tulis deskripsi produk yang meyakinkan untuk marketplace"
            />
            <FeatureCard
              title="Hashtag"
              description="Dapatkan hashtag yang trending dan relevan"
            />
            <FeatureCard
              title="Guide Visual"
              description="Instruksi pembuatan konten visual yang menarik"
            />
            <FeatureCard
              title="Tone Lokal"
              description="Gunakan bahasa daerah untuk menjangkau pasar lokal"
            />
          </div>
        </main>

        <footer className="py-6 text-center text-neutral-500 animate-fade-in-delay-300">
          <p>© {new Date().getFullYear()} Jony Wijaya - Bukan Jokowi Dodo</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-xl shadow-md border border-neutral-800 animate-fade-in animate-duration-500">
      <h3 className="text-xl font-semibold text-neutral-200 mb-2">{title}</h3>
      <p className="text-neutral-400">{description}</p>
    </div>
  );
}