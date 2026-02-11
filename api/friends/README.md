# Friends API

Implements the same friending flow as the Laravel `FriendController`: send/unsend request, accept, unfriend, list friends, list requests + suggestions.

## DB structure (existing)

- **friends**: `user_id` = learner_phone (bigint), per-major columns `korea`, `korea_count`, `english`, `english_count`, … (JSON array of `{ "fri_id": "learner_phone" }`).
- **friend_requests**: `user_id` = learner_phone of the user who **receives** requests; per-major JSON array of `{ "my_id": "sender_learner_phone" }`.

All IDs are **learner_phone** (same as discussion/profile).

## Endpoints

| Method | File | Auth | Body/Query | Description |
|--------|------|------|------------|-------------|
| POST | add.php | Yes | `otherId`, `major` | Send friend request (or unsend if already sent). Returns `action`: `"requested"` / `"first request"` / `"unsent request"`, or `code: "err53"` if friend limit (299) reached. |
| POST | remove-request.php | Yes | `otherId`, `major` | Remove an incoming request (decline). |
| POST | confirm.php | Yes | `otherId`, `major` | Accept request; adds each other to both friends lists. Returns `err53`/`err54` if limit reached. |
| POST | unfriend.php | Yes | `otherId`, `major` | Unfriend (removes from both lists). |
| GET | get-friends.php | No | `userId`, `major` | List of friends for a user. |
| GET | get-requests.php | Yes | `major` | My incoming requests + “people you may know”. |
| GET | get-status.php | Yes | `otherId`, `major` | Status between me and other: `friend` \| `pending_sent` \| `pending_received` \| `none`. |

**major** is one of: `english`, `korea`, `chinese`, `japanese`, `russian` (default `english`).

## React usage

```js
import { friendsAPI } from '../services/api';

// On profile page: show Add Friend / Requested / Accept|Decline / Friends
const { data } = await friendsAPI.getStatus(profileUserId, 'english');
// data.status === 'friend' | 'pending_sent' | 'pending_received' | 'none'

await friendsAPI.addRequest(otherId, 'english');      // send or unsend
await friendsAPI.removeRequest(otherId, 'english');  // decline request
await friendsAPI.confirm(otherId, 'english');        // accept request
await friendsAPI.unfriend(otherId, 'english');       // unfriend

const list = await friendsAPI.getFriends(userId, 'english');   // list.data
const { request, people } = (await friendsAPI.getRequests('english')).data;
```
