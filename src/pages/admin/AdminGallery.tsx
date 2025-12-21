import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Upload, Folder } from "lucide-react";

// Import all existing images
import communityMeeting1 from "@/assets/community-meeting-1.jpg";
import communityMeeting2 from "@/assets/community-meeting-2.jpg";
import communityMeeting3 from "@/assets/community-meeting-3.png";
import communityMeeting4 from "@/assets/community-meeting-4.jpg";
import communityMeeting5 from "@/assets/community-meeting-5.jpg";
import communityMeeting6 from "@/assets/community-meeting-6.jpg";
import communityMeeting7 from "@/assets/community-meeting-7.jpg";
import communityMeeting8 from "@/assets/community-meeting-8.jpg";
import founderImage from "@/assets/founder-inocent-koffi.jpg";
import jalon1 from "@/assets/jalon-1.jpg";
import jalon2 from "@/assets/jalon-2.jpg";
import jalon3 from "@/assets/jalon-3.jpg";
import jalon4 from "@/assets/jalon-4.jpg";
import jalon5 from "@/assets/jalon-5.jpg";
import jalon6 from "@/assets/jalon-6.jpg";
import jalon7 from "@/assets/jalon-7.jpg";
import logo from "@/assets/logo.png";
import logoWhite from "@/assets/logo-white.png";
import nurserySite from "@/assets/nursery-site.webp";
import nurseryPalm from "@/assets/nursery-palm.jpg";
import palmOilProduction from "@/assets/palm-oil-production.jpg";
import posterAgricapital from "@/assets/poster-agricapital.jpg";

const categories = [
  {
    name: "Réunions Communautaires",
    images: [
      { src: communityMeeting1, name: "community-meeting-1.jpg" },
      { src: communityMeeting2, name: "community-meeting-2.jpg" },
      { src: communityMeeting3, name: "community-meeting-3.png" },
      { src: communityMeeting4, name: "community-meeting-4.jpg" },
      { src: communityMeeting5, name: "community-meeting-5.jpg" },
      { src: communityMeeting6, name: "community-meeting-6.jpg" },
      { src: communityMeeting7, name: "community-meeting-7.jpg" },
      { src: communityMeeting8, name: "community-meeting-8.jpg" },
    ]
  },
  {
    name: "Jalons",
    images: [
      { src: jalon1, name: "jalon-1.jpg" },
      { src: jalon2, name: "jalon-2.jpg" },
      { src: jalon3, name: "jalon-3.jpg" },
      { src: jalon4, name: "jalon-4.jpg" },
      { src: jalon5, name: "jalon-5.jpg" },
      { src: jalon6, name: "jalon-6.jpg" },
      { src: jalon7, name: "jalon-7.jpg" },
    ]
  },
  {
    name: "Pépinière & Production",
    images: [
      { src: nurserySite, name: "nursery-site.webp" },
      { src: nurseryPalm, name: "nursery-palm.jpg" },
      { src: palmOilProduction, name: "palm-oil-production.jpg" },
    ]
  },
  {
    name: "Logos & Marketing",
    images: [
      { src: logo, name: "logo.png" },
      { src: logoWhite, name: "logo-white.png" },
      { src: posterAgricapital, name: "poster-agricapital.jpg" },
      { src: founderImage, name: "founder-inocent-koffi.jpg" },
    ]
  },
];

const AdminGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalImages = categories.reduce((acc, cat) => acc + cat.images.length, 0);

  return (
    <AdminLayout title="Galerie d'Images">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Image className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{totalImages}</p>
                  <p className="text-sm text-muted-foreground">Images totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Folder className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-sm text-muted-foreground">Catégories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pour ajouter des images, contactez le développeur ou utilisez le dépôt GitHub.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === null ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Toutes ({totalImages})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.name ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {cat.name} ({cat.images.length})
            </button>
          ))}
        </div>

        {/* Images Grid */}
        {categories
          .filter(cat => selectedCategory === null || cat.name === selectedCategory)
          .map((category) => (
            <Card key={category.name}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {category.images.map((image, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={image.src}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-lg"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <p className="text-white text-xs text-center px-2">{image.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </AdminLayout>
  );
};

export default AdminGallery;
