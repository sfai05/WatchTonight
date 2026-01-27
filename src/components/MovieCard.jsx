import { Card, CardContent } from "@/components/ui/card"

export function MovieCard({ movie }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <Card className="group overflow-hidden border-0 shadow-none">
        <CardContent className="p-0">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center bg-muted text-muted-foreground">
              No poster
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-sm italic text-muted-foreground">“{movie.description}”</p>
    </div>
  )
}
