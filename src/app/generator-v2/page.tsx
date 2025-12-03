"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, MessageCircle } from "lucide-react";
import ChatPopup from "@/components/ChatPopup";

export default function GeneratorPage() {
  const router = useRouter();

  // --- State for Setup Section ---
  const [businessType, setBusinessType] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [tone, setTone] = useState("");
  const [platform, setPlatform] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);

  // --- State for Generation Section ---
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [useLocalDialect, setUseLocalDialect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // --- State for Chat Popup ---
  const [showChat, setShowChat] = useState(false);

  // --- Load Setup Data on Initial Render ---
  useEffect(() => {
    console.log("useEffect running - checking localStorage...");
    const savedData = localStorage.getItem("umkmData");
    console.log("Found savedData in localStorage:", savedData);

    if (savedData) {
      console.log("Data exists, parsing and setting state...");
      const parsed = JSON.parse(savedData);
      setBusinessType(parsed.businessType || "");
      setTargetCustomer(parsed.targetCustomer || "");
      setTone(parsed.tone || "");
      setPlatform(parsed.platform || "");
      setSetupComplete(true);
      console.log("setupComplete set to TRUE inside useEffect"); // Debug log
    } else {
      console.log("No savedData found, setupComplete remains FALSE (initial state)"); // Debug log
    }
  }, []); // <-- Empty dependency array

  console.log("Component render - setupComplete state is:", setupComplete); // Debug log - This runs on every render

  // --- Handle Setup Submission ---
  const handleSetupSave = () => {
    if (!businessType || !targetCustomer || !tone || !platform) {
      alert("Mohon lengkapi semua informasi setup terlebih dahulu.");
      return;
    }

    const data = {
      businessType,
      targetCustomer,
      tone,
      platform,
    };
    localStorage.setItem("umkmData", JSON.stringify(data));
    setSetupComplete(true); 
    console.log("setupComplete set to TRUE after saving setup data"); // Debug log
  };

  // --- Handle Generation ---
  const generateContent = async () => {
    if (!businessType || !targetCustomer || !tone || !platform || !productName || !goal) {
      alert("Mohon lengkapi semua informasi setup dan produk terlebih dahulu.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const prompt = `
        Anda adalah asisten pemasaran AI yang membantu UMKM di Indonesia.
        Berikut adalah informasi bisnis UMKM:
        - Jenis UMKM: ${businessType}
        - Target Customer: ${targetCustomer}
        - Tone yang diinginkan: ${tone}
        - Platform yang digunakan: ${platform}

        Dan informasi produk yang akan dipasarkan:
        - Nama Produk: ${productName}
        - Deskripsi Produk: ${productDescription || "Tidak ada deskripsi tambahan."}
        - Tujuan konten: ${goal}

        ${
          useLocalDialect
            ? "Bila 'True', Gunakan frasa atau gaya bahasa daerah Jawa untuk menjangkau pasar lokal."
            : ""
        }

        INGAT: Hasilkan KONTEN PEMASARAN BERIKUT DALAM FORMAT JSON YANG VALID. TIDAK ADA TEKS PENJELASAN SEBELUM ATAU SESUDAHNYA. TIDAK ADA KODE BLOK MARKDOWN. LANGSUNG KELUARKAN OBJEK JSONNYA SAJA. (Hasil generated content juga harus panjang sesuai dengan kebutuhan masing-masing bagian. minimal diatas 6 kalimat untuk setiap caption, deskripsi, dan sudut pandang marketing. Untuk ide visual, berikan deskripsi yang cukup detail untuk setiap ide konten visual, minimal 6 kalimat.)
        {
          "instagramCaptions": ["caption versi 1...", "caption versi 2...", "caption versi 3..."],
          "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
          "marketplaceDescription": "Deskripsi produk yang menarik dan meyakinkan untuk marketplace...",
          "marketingAngles": ["Sudut pandang pemasaran 1...", "Sudut pandang pemasaran 2...", "Sudut pandang pemasaran 3..."],
          "visualContentGuide": {
            "instagramPictures": [
              "Ide visual untuk posting gambar Instagram 1: ...",
              "Ide visual untuk posting gambar Instagram 2: ...",
              "Ide visual untuk posting gambar Instagram 3: ...",
              "Ide visual untuk posting gambar Instagram 4: ..."
            ],
            "instagramReels": [
              "Ide visual untuk Reels Instagram 1: ...",
              "Ide visual untuk Reels Instagram 2: ...",
              "Ide visual untuk Reels Instagram 3: ..."
            ],
            "whatsapp": "Ide visual atau teks pendek untuk promosi via WhatsApp: ...",
            "otherPlatforms": "Ide visual atau teks untuk platform lain (TikTok, Marketplace, dll): ..."
          }
        }
        Konten harus mengikuti tone yang diinginkan dan sesuai untuk target customer. Ide visual harus disertai dengan isi teks dan warna, serta style yang sesuai dengan tone.
        Caption, deskripsi, sudut pandang marketing, dan ide konten visual harus orisinal dan tidak menjiplak dari sumber manapun, serta panjang sesuai kebutuhan.
        Berikan jawaban dalam bahasa Indonesia bila opsi localDialect 'false' atau 'null'.
      `;

      // Call Next.js API route
      const response = await fetch('/api/cerebras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'gpt-oss-120b',
          max_tokens: 2048,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Route Error:", errorData.error);
        alert(`Terjadi kesalahan saat menghasilkan konten: ${errorData.error}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Raw API Response from Gemini Route:", data);

      // Attempt to parse the JSON response
      let parsedResponse;
      try {
         let aiText = data.response;
         console.log("Raw AI Text from Gemini:", aiText); // Debug log

         // Check if the AI returned an empty response object or non-string
         if (typeof aiText !== 'string') {
             console.error("AI returned a non-string response:", aiText);
             alert("AI mengembalikan format data yang tidak valid (bukan string). Silakan coba lagi.");
             setLoading(false);
             return;
         }

         // Check if the AI returned an empty string
         if (!aiText || aiText.trim() === "") {
             console.error("AI returned an empty response string.");
             alert("AI mengembalikan respons kosong. Silakan coba lagi.");
             setLoading(false);
             return;
         }

         // Improved extraction: First, try to find a JSON code block
         const jsonMatch = aiText.match(/```json\s*\n?([\s\S]*?)\s*```/);

         if (jsonMatch && jsonMatch[1]) {
             console.log("Found JSON within code block:", jsonMatch[1]); // Debug log
             aiText = jsonMatch[1].trim();
         } else {
             // If no code block, assume the entire response is the JSON string
             console.log("No JSON code block found, assuming entire response is JSON.");
             aiText = aiText.trim();
         }

         // Attempt to parse the extracted (or original) text as JSON
         parsedResponse = JSON.parse(aiText);

      } catch (parseError) {
          console.error("Error parsing AI response JSON:", parseError);
          console.error("AI Response Text (for debugging):", data.response); // Log the raw text that failed to parse
          alert("AI mengembalikan format data yang tidak valid. Silakan coba lagi.");
          setLoading(false);
          return;
      }

      // Basic validation to ensure the expected structure exists
      if (
          !parsedResponse ||
          !Array.isArray(parsedResponse.instagramCaptions) ||
          !Array.isArray(parsedResponse.hashtags) ||
          typeof parsedResponse.marketplaceDescription !== 'string' ||
          !Array.isArray(parsedResponse.marketingAngles) ||
          !parsedResponse.visualContentGuide ||
          !Array.isArray(parsedResponse.visualContentGuide.instagramPictures) ||
          !Array.isArray(parsedResponse.visualContentGuide.instagramReels) ||
          typeof parsedResponse.visualContentGuide.whatsapp !== 'string' ||
          typeof parsedResponse.visualContentGuide.otherPlatforms !== 'string'
      ) {
          console.error("AI response structure is invalid:", parsedResponse);
          alert("AI mengembalikan struktur data yang tidak valid. Silakan coba lagi.");
          setLoading(false);
          return;
      }

      setResults(parsedResponse);

    } catch (error) {
      console.error("Network or other error:", error);
      alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // --- Result Card Component ---
  const ResultCard = ({ title, content }: { title: string; content: React.ReactNode }) => {
    return (
      <Card className="shadow-2xl bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-200">{title}</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-12 animate-fade-in">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Decorative elements for Setup Section */}
        {!setupComplete && (
          <div>
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-gentle"></div>
          </div>
        )}
        {/* Decorative elements for Generation Section */}
        {setupComplete && (
          <div>
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-gentle"></div>
          </div>
        )}
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Setup Section */}
        {!setupComplete && (
          <div className="animate-fade-in">
            {/* Clear title for Setup */}
            <h1 className="text-3xl font-bold text-center text-yellow-500 mb-8">Setup Bisnis UMKM</h1>
            <Card className="shadow-2xl bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-200">Setup Bisnis UMKM</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleSetupSave(); }} className="space-y-6">
                  <div>
                    <Label htmlFor="businessType" className="text-neutral-200">Jenis UMKM</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200 mt-2">
                        <SelectValue placeholder="Pilih jenis UMKM" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="food" className="text-neutral-200">F&B</SelectItem>
                        <SelectItem value="fashion" className="text-neutral-200">Fashion</SelectItem>
                        <SelectItem value="craft" className="text-neutral-200">Craft</SelectItem>
                        <SelectItem value="service" className="text-neutral-200">Service</SelectItem>
                        <SelectItem value="agriculture" className="text-neutral-200">Agriculture</SelectItem>
                        <SelectItem value="others" className="text-neutral-200">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetCustomer" className="text-neutral-200">Target Customer</Label>
                    <Input
                      id="targetCustomer"
                      value={targetCustomer}
                      onChange={(e) => setTargetCustomer(e.target.value)}
                      placeholder="Contoh: Ibu rumah tangga, anak muda, pekerja kantoran"
                      className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tone" className="text-neutral-200">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200 mt-2">
                        <SelectValue placeholder="Pilih tone" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="friendly" className="text-neutral-200">Friendly</SelectItem>
                        <SelectItem value="formal" className="text-neutral-200">Formal</SelectItem>
                        <SelectItem value="humor" className="text-neutral-200">Humor</SelectItem>
                        <SelectItem value="casual" className="text-neutral-200">Casual</SelectItem>
                        <SelectItem value="luxury" className="text-neutral-200">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="platform" className="text-neutral-200">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200 mt-2">
                        <SelectValue placeholder="Pilih platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="instagram" className="text-neutral-200">Instagram</SelectItem>
                        <SelectItem value="whatsapp" className="text-neutral-200">WhatsApp</SelectItem>
                        <SelectItem value="tiktok" className="text-neutral-200">TikTok</SelectItem>
                        <SelectItem value="marketplace" className="text-neutral-200">Marketplace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-semibold py-6 rounded-lg shadow-lg shadow-yellow-500/20 transition-all hover:shadow-yellow-500/40"
                  >
                    Lanjutkan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generation Section */}
        {setupComplete && (
          <div className="animate-fade-in">
            {/* Clear title for Generation */}
            <h1 className="text-3xl font-bold text-center text-yellow-500 mb-8">Content Generator</h1>

            <Card className="mb-8 shadow-2xl bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-200">Generate Konten Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="productName" className="text-neutral-200 mb-2">Nama Produk *</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Contoh: Keripik Singkong"
                      className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 mt-3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal" className="text-neutral-200 mb-2">Goal Konten *</Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200 mt-3">
                        <SelectValue placeholder="Pilih goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-200">
                        <SelectItem value="promo">Promo</SelectItem>
                        <SelectItem value="edukasi">Edukasi</SelectItem>
                        <SelectItem value="storytelling">Storytelling</SelectItem>
                        <SelectItem value="hardSell">Hard Sell</SelectItem>
                        <SelectItem value="softSell">Soft Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="productDescription" className="text-neutral-200 mb-2">Deskripsi Produk (Opsional)</Label>
                  <Input
                    id="productDescription"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Contoh: Keripik singkong renyah dengan rasa gurih pedas"
                    className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 mt-3"
                  />
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox
                    id="localDialect"
                    checked={useLocalDialect}
                    onCheckedChange={(checked) => setUseLocalDialect(!!checked)}
                    className="border-neutral-700 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-neutral-900"
                  />
                  <Label htmlFor="localDialect" className="text-neutral-200">
                    Gunakan Bahasa Daerah (Jawa - "Karena JAWA adalah Koentji")
                  </Label>
                </div>

                <Button
                  onClick={generateContent}
                  disabled={loading || !businessType || !targetCustomer || !tone || !platform || !productName || !goal}
                  className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-semibold shadow-lg shadow-yellow-500/20 transition-all hover:shadow-yellow-500/40"
                >
                  {loading ? "Menghasilkan..." : "Generate Konten"}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            {results && (
              <div className="space-y-6 animate-fade-in-up">
                <ResultCard
                  title="Caption Instagram"
                  content={
                    <div className="space-y-4">
                      {results.instagramCaptions?.map(
                        (caption: string, index: number) => (
                          <div key={index} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                            <p className="text-neutral-200">{caption}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(caption)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Copy className="w-4 h-4 mr-1" /> Salin
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  }
                />

                <ResultCard
                  title="Hashtag"
                  content={
                    <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                      <p className="text-neutral-200">{results.hashtags?.join(" ")}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(results.hashtags?.join(" "))}
                          className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                        >
                          <Copy className="w-4 h-4 mr-1" /> Salin
                        </Button>
                      </div>
                    </div>
                  }
                />

                <ResultCard
                  title="Deskripsi Marketplace"
                  content={
                    <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                      <p className="text-neutral-200">{results.marketplaceDescription}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(results.marketplaceDescription)
                          }
                          className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                        >
                          <Copy className="w-4 h-4 mr-1" /> Salin
                        </Button>
                      </div>
                    </div>
                  }
                />

                {/* Visual Content Guide Card */}
                <ResultCard
                  title="Panduan Konten Visual"
                  content={
                    <div className="space-y-6">
                      {results.visualContentGuide?.instagramPictures && (
                        <div>
                          <h4 className="font-semibold mb-2 text-neutral-200">Instagram (Gambar):</h4>
                          <div className="space-y-3">
                            {results.visualContentGuide.instagramPictures.map((idea: string, index: number) => (
                              <div key={`pic-${index}`} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                                <p className="text-neutral-200">{idea}</p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(idea)}
                                    className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                                  >
                                    <Copy className="w-4 h-4 mr-1" /> Salin
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.visualContentGuide?.instagramReels && (
                        <div>
                          <h4 className="font-semibold mb-2 text-neutral-200">Instagram (Reels):</h4>
                          <div className="space-y-3">
                            {results.visualContentGuide.instagramReels.map((idea: string, index: number) => (
                              <div key={`reel-${index}`} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                                <p className="text-neutral-200">{idea}</p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(idea)}
                                    className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                                  >
                                    <Copy className="w-4 h-4 mr-1" /> Salin
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.visualContentGuide?.whatsapp && (
                        <div>
                          <h4 className="font-semibold mb-2 text-neutral-200">WhatsApp:</h4>
                          <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                            <p className="text-neutral-200">{results.visualContentGuide.whatsapp}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(results.visualContentGuide.whatsapp)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Copy className="w-4 h-4 mr-1" /> Salin
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {results.visualContentGuide?.otherPlatforms && (
                        <div>
                          <h4 className="font-semibold mb-2 text-neutral-200">Platform Lain (TikTok, Marketplace, dll.):</h4>
                          <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                            <p className="text-neutral-200">{results.visualContentGuide.otherPlatforms}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(results.visualContentGuide.otherPlatforms)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Copy className="w-4 h-4 mr-1" /> Salin
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  }
                />

                <ResultCard
                  title="Sudut Pandang Marketing"
                  content={
                    <div className="space-y-2">
                      {results.marketingAngles?.map(
                        (angle: string, index: number) => (
                          <div key={index} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                            <p className="text-neutral-200">{angle}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(angle)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Copy className="w-4 h-4 mr-1" /> Salin
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Chat */}
      <div className="fixed bottom-8 right-8 z-20">
        <Button
          onClick={() => setShowChat(true)}
          className="w-14 h-14 rounded-full bg-yellow-500 hover:bg-yellow-600 text-neutral-900 shadow-lg shadow-yellow-500/20 transition-all hover:shadow-yellow-500/40"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Chat Popup Component */}
      {showChat && (
        <ChatPopup
          onClose={() => setShowChat(false)}
          context={{
            businessType,
            targetCustomer,
            tone,
            platform,
            productName,
            productDescription,
            goal,
            useLocalDialect,
            generatedResults: results,
          }}
        />
      )}
    </div>
  );
}