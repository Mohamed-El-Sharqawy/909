import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useColors, useCreateColor, useUpdateColor, useDeleteColor } from "@/features/colors";
import type { Color } from "@ecommerce/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export function ColorsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);

  const { data: response, isLoading } = useColors();
  const createMutation = useCreateColor();
  const updateMutation = useUpdateColor();
  const deleteMutation = useDeleteColor();

  const colors = response?.data ?? [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      nameEn: formData.get("nameEn") as string,
      nameAr: formData.get("nameAr") as string,
      hex: formData.get("hex") as string,
    };

    try {
      if (editingColor) {
        await updateMutation.mutateAsync({ id: editingColor.id, body });
        toast.success("Color updated");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Color created");
      }
      setIsDialogOpen(false);
      setEditingColor(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Color deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const openEdit = (color: Color) => {
    setEditingColor(color);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingColor(null);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colors</h1>
          <p className="mt-1 text-muted-foreground">
            Manage product colors.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Color
        </Button>
      </div>

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Name (AR)</TableHead>
              <TableHead>Hex</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : colors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No colors found.
                </TableCell>
              </TableRow>
            ) : (
              colors.map((color) => (
                <TableRow key={color.id}>
                  <TableCell>
                    <div
                      className="h-8 w-8 rounded-full border"
                      style={{ backgroundColor: color.hex }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{color.nameEn}</TableCell>
                  <TableCell>{color.nameAr}</TableCell>
                  <TableCell className="font-mono text-sm">{color.hex}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(color)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(color.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingColor ? "Edit Color" : "Add Color"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nameEn">Name (English)</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  defaultValue={editingColor?.nameEn ?? ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nameAr">Name (Arabic)</Label>
                <Input
                  id="nameAr"
                  name="nameAr"
                  defaultValue={editingColor?.nameAr ?? ""}
                  required
                  dir="rtl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hex">Hex Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="hex"
                    name="hex"
                    type="color"
                    defaultValue={editingColor?.hex ?? "#000000"}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    placeholder="#000000"
                    defaultValue={editingColor?.hex ?? ""}
                    className="flex-1 font-mono"
                    onChange={(e) => {
                      const colorInput = document.getElementById("hex") as HTMLInputElement;
                      if (colorInput && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        colorInput.value = e.target.value;
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingColor ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
