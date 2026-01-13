import { useEffect, useState } from "react";
import {
  getMembers,
  addMember as dbAddMember,
  updateMember as dbUpdateMember,
  deleteMember as dbDeleteMember,
} from "@/db/indexedDb";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Trash2, Edit2, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* --------------------------
   LOCAL HOOKS (IndexedDB)
-------------------------- */

function useMembers() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const members = await getMembers();
    setData(members || []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { data, isLoading, refetch: load };
}

function useCreateMember(refetch: () => void) {
  return {
    mutate: async (payload: any, options?: any) => {
      await dbAddMember(payload);
      refetch();
      options?.onSuccess?.();
    },
    isPending: false,
  };
}

function useUpdateMember(refetch: () => void) {
  return {
    mutate: async (payload: any, options?: any) => {
      await dbUpdateMember(payload);
      refetch();
      options?.onSuccess?.();
    },
    isPending: false,
  };
}

function useDeleteMember(refetch: () => void) {
  return {
    mutate: async (id: number) => {
      await dbDeleteMember(id);
      refetch();
    },
  };
}

/* --------------------------
   MAIN COMPONENT
-------------------------- */

export default function Members() {
  const { data: members, isLoading, refetch } = useMembers();
  const { mutate: deleteMember } = useDeleteMember(refetch);
  const { toast } = useToast();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Family Members
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage family members and their monthly contributions.
          </p>
        </div>
        <AddMemberDialog refetch={refetch} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onDelete={() => {
              deleteMember(member.id);
              toast({
                title: "Deleted",
                description: "Member removed successfully",
              });
            }}
            refetch={refetch}
          />
        ))}

        {members.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
            No family members added yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------
   MEMBER CARD
-------------------------- */

function MemberCard({
  member,
  onDelete,
  refetch,
}: {
  member: any;
  onDelete: () => void;
  refetch: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [contribution, setContribution] = useState(
    member.contribution.toString()
  );

  const { mutate: updateMember, isPending } = useUpdateMember(refetch);
  const { toast } = useToast();

  const handleUpdate = () => {
    updateMember(
      { ...member, contribution: Number(contribution) },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({
            title: "Updated",
            description: "Contribution updated successfully",
          });
        },
      }
    );
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/60 bg-card group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {member.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{member.name}</CardTitle>
            <CardDescription>Contributor</CardDescription>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-medium">
            Monthly Contribution
          </span>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                className="w-24 h-8 text-right font-mono"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
              />
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={handleUpdate}
                disabled={isPending}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 group/edit cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <span className="text-xl font-bold font-mono">
                ₹{member.contribution}
              </span>
              <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover/edit:opacity-100" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------------
   ADD MEMBER DIALOG
-------------------------- */

function AddMemberDialog({ refetch }: { refetch: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", contribution: "" });
  const { toast } = useToast();

  const { mutate: create, isPending } = useCreateMember(refetch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      {
        name: formData.name,
        contribution: Number(formData.contribution),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setFormData({ name: "", contribution: "" });
          toast({
            title: "Member Added",
            description: `${formData.name} added to the family.`,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" /> Add Member
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              required
              placeholder="e.g. Papa"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Monthly Contribution (₹)</Label>
            <Input
              required
              type="number"
              placeholder="5000"
              value={formData.contribution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contribution: e.target.value,
                })
              }
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Save Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
