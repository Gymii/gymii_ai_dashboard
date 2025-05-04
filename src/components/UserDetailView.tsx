import { useState } from "react";
import {
  FaceSmileIcon as FaceSmileIconOutline,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { Listbox } from "@headlessui/react";
import {
  FaceFrownIcon,
  FaceSmileIcon as FaceSmileIconMini,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/20/solid";
import { RawUser, useRawUserData } from "../hooks/useKPI";
import { format } from "date-fns";
import {
  useAdminComments,
  useAddAdminComment,
  useUpdateAdminComment,
  useDeleteAdminComment,
  AdminComment,
} from "../hooks/useAdminComments";
import { useAuth } from "../store/auth-context";

// Mood selection options for comments
const moods = [
  {
    name: "Excited",
    value: "excited",
    icon: FireIcon,
    iconColor: "text-white",
    bgColor: "bg-red-500",
  },
  {
    name: "Loved",
    value: "loved",
    icon: HeartIcon,
    iconColor: "text-white",
    bgColor: "bg-pink-400",
  },
  {
    name: "Happy",
    value: "happy",
    icon: FaceSmileIconMini,
    iconColor: "text-white",
    bgColor: "bg-green-400",
  },
  {
    name: "Sad",
    value: "sad",
    icon: FaceFrownIcon,
    iconColor: "text-white",
    bgColor: "bg-yellow-400",
  },
  {
    name: "Thumbsy",
    value: "thumbsy",
    icon: HandThumbUpIcon,
    iconColor: "text-white",
    bgColor: "bg-blue-500",
  },
  {
    name: "I feel nothing",
    value: null,
    icon: XMarkIcon,
    iconColor: "text-gray-400",
    bgColor: "bg-transparent",
  },
];

// Sample activity data - would be replaced with real data
// TODO: Replace with real user activity data from API
const sampleActivityData = [
  { id: 1, action: "Completed onboarding", date: "2023-12-21T10:23:00Z" },
  { id: 2, action: "Subscription renewed", date: "2024-01-15T08:45:00Z" },
  { id: 3, action: "Added dietary preferences", date: "2024-01-18T14:12:00Z" },
  { id: 4, action: "Updated profile", date: "2024-01-25T11:30:00Z" },
];

// Helper function to classify comments by mood
function getMoodData(moodValue: string | null) {
  return moods.find((mood) => mood.value === moodValue) || moods[5];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface UserDetailViewProps {
  user: RawUser;
}

export default function UserDetailView({ user }: UserDetailViewProps) {
  const [selected, setSelected] = useState(moods[5]);
  const [commentText, setCommentText] = useState("");
  const { user: currentUser } = useAuth();
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingMood, setEditingMood] = useState(moods[5]);

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useAdminComments(
    user.id
  );

  // Mutations
  const addComment = useAddAdminComment();
  const updateComment = useUpdateAdminComment();
  const deleteComment = useDeleteAdminComment();
  const { data: users } = useRawUserData();

  const handlePostComment = () => {
    if (!commentText.trim()) return;

    addComment.mutate(
      {
        userId: user.id,
        text: commentText,
        mood: selected.value,
      },
      {
        onSuccess: () => {
          setCommentText("");
          setSelected(moods[5]); // Reset mood
        },
      }
    );
  };

  const handleStartEdit = (comment: AdminComment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
    setEditingMood(getMoodData(comment.mood));
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
    setEditingMood(moods[5]);
  };

  const handleSaveEdit = () => {
    if (!editingCommentId || !editingText.trim()) return;

    updateComment.mutate(
      {
        commentId: editingCommentId,
        text: editingText,
        mood: editingMood.value,
        userId: user.id,
      },
      {
        onSuccess: () => {
          handleCancelEdit();
        },
      }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteComment.mutate({
        commentId,
        userId: user.id,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            User Profile
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Account details and information.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.first_name}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.email}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Subscription status
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.auto_renew_enabled ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Subscription plan
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.product_id}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created at</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(user.created_at), "MMMM d, yyyy")}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last active</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.last_active
                  ? format(new Date(user.last_active), "MMMM d, yyyy h:mm a")
                  : "Never"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Activity
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            User's recent actions.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {sampleActivityData.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.action}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {format(new Date(activity.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {format(new Date(activity.date), "h:mm a")}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Comments
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Add notes about this user.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5">
          {/* Comment Input */}
          <div className="flex items-start space-x-4">
            <div className="shrink-0">
              <div className="inline-block size-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                {currentUser?.email?.charAt(0) || "A"}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="border-b border-gray-200 pb-px focus-within:border-b-2 focus-within:border-indigo-600 focus-within:pb-0">
                <label htmlFor="comment" className="sr-only">
                  Add your comment
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  placeholder="Add your comment..."
                  className="block bg-white w-full resize-none text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>
              <div className="flex justify-between pt-2">
                <div className="flex items-center space-x-5">
                  <div className="flow-root">
                    <button
                      type="button"
                      className="-m-2 inline-flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                    >
                      <PaperClipIcon aria-hidden="true" className="size-6" />
                      <span className="sr-only">Attach a file</span>
                    </button>
                  </div>
                  <div className="flow-root">
                    <Listbox value={selected} onChange={setSelected}>
                      <div className="relative">
                        <Listbox.Button className="relative -m-2 inline-flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                          <span className="flex items-center justify-center">
                            {selected.value === null ? (
                              <span>
                                <FaceSmileIconOutline
                                  aria-hidden="true"
                                  className="size-6 shrink-0"
                                />
                                <span className="sr-only">Add your mood</span>
                              </span>
                            ) : (
                              <span>
                                <span
                                  className={classNames(
                                    selected.bgColor,
                                    "flex size-8 items-center justify-center rounded-full"
                                  )}
                                >
                                  <selected.icon
                                    aria-hidden="true"
                                    className="size-5 shrink-0 text-white"
                                  />
                                </span>
                                <span className="sr-only">{selected.name}</span>
                              </span>
                            )}
                          </span>
                        </Listbox.Button>

                        <Listbox.Options className="absolute z-10 -ml-6 w-60 rounded-lg bg-white py-3 text-base shadow outline outline-1 outline-black/5 data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:ml-auto sm:w-64 sm:text-sm">
                          {moods.map((mood) => (
                            <Listbox.Option
                              key={mood.value || "none"}
                              value={mood}
                              className="cursor-default select-none bg-white px-3 py-2 data-[focus]:relative data-[focus]:bg-gray-100 data-[focus]:outline-none"
                            >
                              <div className="flex items-center">
                                <div
                                  className={classNames(
                                    mood.bgColor,
                                    "flex size-8 items-center justify-center rounded-full"
                                  )}
                                >
                                  <mood.icon
                                    aria-hidden="true"
                                    className={classNames(
                                      mood.iconColor,
                                      "size-5 shrink-0"
                                    )}
                                  />
                                </div>
                                <span className="ml-3 block truncate font-medium text-gray-900">
                                  {mood.name}
                                </span>
                              </div>
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </Listbox>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={handlePostComment}
                    disabled={addComment.isPending || !commentText.trim()}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addComment.isPending ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Comments */}
          <div className="mt-6 space-y-4">
            {commentsLoading ? (
              <p className="text-center text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-500">No comments yet</p>
            ) : (
              comments.map((comment) => {
                const moodData = getMoodData(comment.mood);
                const isEditing = editingCommentId === comment.id;

                return (
                  <div key={comment.id} className="flex items-start space-x-4">
                    <div className="shrink-0">
                      <div className="inline-block size-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                        {users?.[comment.author_id]?.first_name?.charAt(0) ||
                          "A"}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {users?.[comment.author_id]?.first_name || "Admin"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(
                              new Date(comment.created_at),
                              "MMM d, yyyy h:mm a"
                            )}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {comment.mood && !isEditing && (
                            <div
                              className={classNames(
                                getMoodData(comment.mood).bgColor,
                                "flex size-8 items-center justify-center rounded-full"
                              )}
                            >
                              <moodData.icon
                                aria-hidden="true"
                                className="size-5 shrink-0 text-white"
                              />
                            </div>
                          )}
                          <button
                            onClick={() => handleStartEdit(comment)}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Edit comment"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete comment"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="mt-2">
                          <textarea
                            rows={3}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="block bg-white w-full resize-none border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm/6"
                            aria-label="Edit comment"
                            placeholder="Edit your comment..."
                          />
                          <div className="mt-2 flex items-center justify-between">
                            <Listbox
                              value={editingMood}
                              onChange={setEditingMood}
                            >
                              <div className="relative">
                                <Listbox.Button className="relative inline-flex items-center space-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                  <span
                                    className={classNames(
                                      editingMood.bgColor,
                                      "flex size-5 items-center justify-center rounded-full"
                                    )}
                                  >
                                    <editingMood.icon
                                      aria-hidden="true"
                                      className="size-3 shrink-0 text-white"
                                    />
                                  </span>
                                  <span>{editingMood.name}</span>
                                </Listbox.Button>

                                <Listbox.Options className="absolute z-10 mt-1 w-60 rounded-lg bg-white py-3 text-base shadow outline outline-1 outline-black/5 data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:w-64 sm:text-sm">
                                  {moods.map((mood) => (
                                    <Listbox.Option
                                      key={mood.value || "none"}
                                      value={mood}
                                      className="cursor-default select-none bg-white px-3 py-2 data-[focus]:relative data-[focus]:bg-gray-100 data-[focus]:outline-none"
                                    >
                                      <div className="flex items-center">
                                        <div
                                          className={classNames(
                                            mood.bgColor,
                                            "flex size-8 items-center justify-center rounded-full"
                                          )}
                                        >
                                          <mood.icon
                                            aria-hidden="true"
                                            className={classNames(
                                              mood.iconColor,
                                              "size-5 shrink-0"
                                            )}
                                          />
                                        </div>
                                        <span className="ml-3 block truncate font-medium text-gray-900">
                                          {mood.name}
                                        </span>
                                      </div>
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </div>
                            </Listbox>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleCancelEdit}
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                disabled={
                                  updateComment.isPending || !editingText.trim()
                                }
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updateComment.isPending ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-700">
                          {comment.text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
