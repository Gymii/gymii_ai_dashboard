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
} from "@heroicons/react/20/solid";
import { RawUser } from "../hooks/useKPI";
import { format } from "date-fns";

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
const sampleActivityData = [
  { id: 1, action: "Completed onboarding", date: "2023-12-21T10:23:00Z" },
  { id: 2, action: "Subscription renewed", date: "2024-01-15T08:45:00Z" },
  { id: 3, action: "Added dietary preferences", date: "2024-01-18T14:12:00Z" },
  { id: 4, action: "Updated profile", date: "2024-01-25T11:30:00Z" },
];

// Define type for comments
interface Comment {
  id: number;
  text: string;
  author: string;
  date: string;
  mood: string | null;
}

// Sample comments - would be replaced with real data
const sampleComments: Comment[] = [
  {
    id: 1,
    text: "User reported difficulty with meal planning feature",
    author: "Support Team",
    date: "2024-01-20T09:10:00Z",
    mood: "sad",
  },
  {
    id: 2,
    text: "Follow-up call scheduled for next week",
    author: "Account Manager",
    date: "2024-01-22T15:45:00Z",
    mood: "happy",
  },
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
  const [comments, setComments] = useState(sampleComments);

  const handlePostComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: comments.length + 1,
      text: commentText,
      author: "You",
      date: new Date().toISOString(),
      mood: selected.value,
    };

    setComments([newComment, ...comments]);
    setCommentText("");
    setSelected(moods[5]); // Reset mood
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
                You
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
                                <span className="ml-3 block truncate font-medium">
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
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Comments */}
          <div className="mt-6 space-y-4">
            {comments.map((comment) => {
              const moodData = getMoodData(comment.mood);
              return (
                <div key={comment.id} className="flex items-start space-x-4">
                  <div className="shrink-0">
                    <div className="inline-block size-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                      {comment.author.charAt(0)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {comment.author}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(comment.date), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                      {comment.mood && (
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
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{comment.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
