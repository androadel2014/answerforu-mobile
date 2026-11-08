<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$path = get_path();
$meth = method();
// v6.3.4: isolated RideOffer API. Never touch the main AnswerForU DB on ingest.
if ($path === '/rideoffer/v1/ingest' || $path === '/admin/rideoffer' || str_starts_with($path, '/admin/rideoffer/')) {
    require_once __DIR__ . '/rideoffer.php';
    ro_route($path, $meth);
}
$pdo = db();
$viewer = current_user_id(false);
require_once __DIR__.'/published-content.php';
// Safe, idempotent published-content DB import on first normal API request.
afu_static_catalog_ensure($pdo);

// v6.2.0: read-only content-file API. Files in api/content-static are the server
// canonical source. No database writes, and legacy API paths remain unchanged.
if ($meth === 'GET' && preg_match('#^/(?:content/static|citizenship/content)/(citizenship-guide|citizenship-civics|citizenship-vocabulary|marketplace-categories|roadmap-guides|roadmap-guide-locales|roadmap-warnings-locales|roadmap-warnings-ar|roadmap-actions|roadmap-effort|roadmap-costs|state-agencies|state-health-marketplaces|curated-cities|roadmap-dv-template|search-synonyms)$#D', $path, $contentMatch)) {
    $key=$contentMatch[1];
    try { $published=afu_static_content_fetch($pdo,$key); }
    catch (Throwable $e) { fail('Content temporarily unavailable',503); }
    $decoded=$published['data'];
    $origin=$published['source'];
    header('Cache-Control: public, max-age=300');
    response_json(['ok'=>true,'version'=>runtime_release(),'key'=>$key,'data'=>$decoded,'source'=>$origin]);
}


if ($path === '/survival-english' || str_starts_with($path, '/survival-english/')) {
    require_once __DIR__.'/survival-english.php';
    afu_survival_route($pdo,$path,$meth);
}


// Safe additive moderation migration. Existing data is preserved.
// SQLite local mode is migrated centrally by ensure_sqlite_schema() in bootstrap.php.
// Old releases checked 20+ columns and executed two UPDATE statements on every
// API request. Cache a successful migration outside public_html per release.
// If secure marker storage is not writable, retain the original fail-safe behavior.
$afuSchemaMarker = null;
if (!is_sqlite() && is_production_runtime()) {
    $afuPrivateRoot = afu_private_runtime_storage_root();
    if ($afuPrivateRoot !== null) {
        $afuSchemaMarker = $afuPrivateRoot . DIRECTORY_SEPARATOR . 'security' . DIRECTORY_SEPARATOR . 'schema-' . runtime_release() . '.ready';
    }
}
if (!is_sqlite() && ($afuSchemaMarker === null || !is_file($afuSchemaMarker))) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS marketplace_listing_changes (id BIGINT AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT NOT NULL, user_id BIGINT NOT NULL, source_type VARCHAR(32) NOT NULL DEFAULT 'marketplace', payload_json LONGTEXT NOT NULL, status VARCHAR(32) NOT NULL DEFAULT 'pending', admin_reason LONGTEXT NULL, reviewed_by BIGINT NULL, created_at TEXT NULL, reviewed_at TEXT NULL, INDEX idx_mlc_status(status), INDEX idx_mlc_listing(listing_id), INDEX idx_mlc_source(source_type,listing_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $pdo->exec("CREATE TABLE IF NOT EXISTS moderation_events (id BIGINT AUTO_INCREMENT PRIMARY KEY, entity_type VARCHAR(40) NOT NULL, entity_id VARCHAR(80) NOT NULL, user_id BIGINT NOT NULL, actor_id BIGINT NULL, event_type VARCHAR(40) NOT NULL, from_status VARCHAR(32) NULL, to_status VARCHAR(32) NULL, reason LONGTEXT NULL, meta_json LONGTEXT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_me_user(user_id,created_at), INDEX idx_me_entity(entity_type,entity_id,created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        if (!schema_has_column($pdo,'marketplace_listing_changes','source_type')) {
            $pdo->exec("ALTER TABLE marketplace_listing_changes ADD COLUMN source_type VARCHAR(32) NOT NULL DEFAULT 'marketplace' AFTER user_id");
        }
        foreach ([
            ['marketplace_listings','status',"VARCHAR(32) NULL DEFAULT 'approved'"],
            ['marketplace_listings','is_active','TINYINT(1) NULL DEFAULT 1'],
            ['marketplace_listings','admin_reason','LONGTEXT NULL'],
            ['marketplace_listings','reviewed_by','BIGINT NULL'],
            ['marketplace_listings','reviewed_at','TEXT NULL'],
            ['community_places','status',"VARCHAR(32) NULL DEFAULT 'approved'"],
            ['community_places','reviewed_by','BIGINT NULL'],
            ['community_places','reviewed_at','TEXT NULL'],
            ['community_places','admin_reason','LONGTEXT NULL'],
            ['community_places','images','LONGTEXT NULL'],
            ['community_places','denomination','VARCHAR(160) NULL'],
            ['community_places','language_tags','LONGTEXT NULL'],
            ['community_places','culture_tags','LONGTEXT NULL'],
            ['community_places','google_place_id','VARCHAR(255) NULL'],
            ['community_places','google_maps_url','TEXT NULL'],
            ['community_places','source_provider','VARCHAR(120) NULL'],
            ['community_places','source_id','VARCHAR(255) NULL'],
            ['community_places','source_url','TEXT NULL'],
            ['community_places','source_checked_at','VARCHAR(32) NULL'],
            ['community_places','confidence','VARCHAR(32) NULL'],
            ['community_places','is_seeded','TINYINT(1) NOT NULL DEFAULT 0'],
            ['community_places','import_batch','VARCHAR(120) NULL'],
            ['community_places','source_rating','DECIMAL(4,2) NULL'],
            ['community_places','source_review_count','INT NULL'],
            ['community_places','latitude','DECIMAL(10,7) NULL'],
            ['community_places','longitude','DECIMAL(10,7) NULL'],
            ['community_groups','status',"VARCHAR(32) NULL DEFAULT 'approved'"],
            ['community_groups','reviewed_by','BIGINT NULL'],
            ['community_groups','reviewed_at','TEXT NULL'],
            ['community_groups','admin_reason','LONGTEXT NULL']
        ] as $colDef) {
            if (!schema_has_column($pdo,$colDef[0],$colDef[1])) {
                $pdo->exec("ALTER TABLE `{$colDef[0]}` ADD COLUMN `{$colDef[1]}` {$colDef[2]}");
            }
        }
        $pdo->exec("UPDATE marketplace_listing_changes SET source_type='marketplace' WHERE source_type IS NULL OR TRIM(source_type)=''");
        $pdo->exec("UPDATE community_places SET status='approved' WHERE status IS NULL OR TRIM(status)=''");
        $pdo->exec("UPDATE community_groups SET status='approved' WHERE status IS NULL OR TRIM(status)=''");
        if ($afuSchemaMarker !== null) {
            $markerDir = dirname($afuSchemaMarker);
            if (is_dir($markerDir) || @mkdir($markerDir, 0700, true) || is_dir($markerDir)) {
                @file_put_contents($afuSchemaMarker, date('c') . "\n", LOCK_EX);
                @chmod($afuSchemaMarker, 0600);
            }
        }
    } catch (Throwable $e) {
        error_log('AnswerForU moderation schema migration failed: '.$e->getMessage());
    }
}

require_once __DIR__ . '/place-quality.php';

// Citizenship module: separate additive tables; no changes to existing route behavior.
if (str_starts_with($path,'/citizenship/') || str_starts_with($path,'/admin/citizenship/')) {
    require_once __DIR__ . '/citizenship.php';
    afu_citizenship_route($pdo,$path,$meth);
}


function notify_user(int $userId, string $title, string $description, string $type='listing_moderation', string $link=''): void {
    if ($userId <= 0) return;
    // A successful action is already confirmed inline; don't notify the actor
    // about their own submission, edit, rating or moderation. This applies to
    // all callers, including legacy listing-change helper functions.
    if ($userId === (int)(current_user_id(false) ?? 0)) return;
    try { db()->prepare('INSERT INTO notifications (user_id,title,description,type,link,is_read,created_at) VALUES (?,?,?,?,?,0,?)')->execute([$userId,$title,$description,$type,$link,now_sql()]); } catch (Throwable $e) {}
}

function moderation_event(string $entityType, string|int $entityId, int $userId, string $eventType, ?string $fromStatus=null, ?string $toStatus=null, ?string $reason=null, ?int $actorId=null, array $meta=[]): void {
    if ($userId <= 0 || trim((string)$entityId)==='') return;
    try {
        db()->prepare('INSERT INTO moderation_events (entity_type,entity_id,user_id,actor_id,event_type,from_status,to_status,reason,meta_json,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
            ->execute([$entityType,(string)$entityId,$userId,$actorId,$eventType,$fromStatus,$toStatus,$reason,json_encode($meta,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),now_sql()]);
    } catch (Throwable $e) { error_log('AnswerForU moderation event failed: '.$e->getMessage()); }
}


function moderation_target(string $rawId): ?array {
    $rawId = trim($rawId);
    if ($rawId === '') return null;
    $lower = strtolower($rawId);
    $kind = 'marketplace';
    $table = 'marketplace_listings';
    if (preg_match('/^(?:place|places)_(\d+)$/i',$rawId,$m)) {
        $kind='places'; $table='community_places'; $id=(int)$m[1];
    } elseif (preg_match('/^(?:group|groups)_(\d+)$/i',$rawId,$m)) {
        $kind='groups'; $table='community_groups'; $id=(int)$m[1];
    } else {
        $id=(int)preg_replace('/\D+/','',$rawId);
    }
    if ($id <= 0) return null;
    return ['kind'=>$kind,'table'=>$table,'id'=>$id,'raw'=>$rawId];
}

function moderation_public_link(array $target, array $row): string {
    if ($target['kind']==='places') return '/marketplace/item/place_'.$target['id'];
    if ($target['kind']==='groups') return '/marketplace/item/group_'.$target['id'];
    return '/marketplace/item/listing_'.($row['id']??$target['id']);
}

function moderation_owner_id(array $target, array $row): int {
    if ($target['kind']==='marketplace') return (int)($row['user_id']??$row['created_by']??0);
    return (int)($row['created_by']??0);
}

/**
 * Put an edit of an already-approved item back in the moderation queue.
 * If the latest request was rejected, reuse THAT SAME row so the rejected
 * request visibly moves to pending instead of leaving a dead rejected row
 * while a hidden replacement is created.
 */
function queue_listing_change(string $source, int $listingId, int $userId, array $payload): array {
    $pdo=db();
    $source=strtolower(trim($source));
    if(!in_array($source,['marketplace','places','groups'],true))$source='marketplace';
    $ts=now_sql();

    $find=$pdo->prepare("SELECT * FROM marketplace_listing_changes WHERE source_type=? AND listing_id=? AND user_id=? AND status='rejected' ORDER BY id DESC LIMIT 1");
    $find->execute([$source,$listingId,$userId]);
    $rejected=$find->fetch();

    if($rejected){
        $old=json_decode((string)($rejected['payload_json']??'{}'),true);
        if(!is_array($old))$old=[];
        $merged=array_merge($old,$payload);
        $cid=(int)$rejected['id'];
        $pdo->prepare("UPDATE marketplace_listing_changes SET payload_json=?,status='pending',admin_reason=NULL,reviewed_by=NULL,reviewed_at=NULL,created_at=? WHERE id=? AND user_id=?")
            ->execute([json_encode($merged,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),$ts,$cid,$userId]);
        $pdo->prepare("UPDATE marketplace_listing_changes SET status='superseded' WHERE source_type=? AND listing_id=? AND user_id=? AND status IN ('pending','rejected') AND id<>?")
            ->execute([$source,$listingId,$userId,$cid]);
        $check=$pdo->prepare('SELECT * FROM marketplace_listing_changes WHERE id=? LIMIT 1');$check->execute([$cid]);$fresh=$check->fetch();
        if(!$fresh||strtolower((string)($fresh['status']??''))!=='pending')fail('Rejected edit request did not return to pending',500);
        moderation_event($source.'_change',$cid,$userId,'resubmitted','rejected','pending','User edited the rejected request and sent it back for review.',null,['listing_id'=>$listingId]);
        notify_user($userId,'Changes resubmitted','Your corrected changes are back in the admin review queue.','listing_change_pending','/my-requests');
        return ['id'=>$cid,'reused'=>true,'queue_at'=>$ts,'request'=>$fresh];
    }

    $pdo->prepare("UPDATE marketplace_listing_changes SET status='superseded' WHERE source_type=? AND listing_id=? AND user_id=? AND status='pending'")
        ->execute([$source,$listingId,$userId]);
    $pdo->prepare('INSERT INTO marketplace_listing_changes (listing_id,user_id,source_type,payload_json,status,created_at) VALUES (?,?,?,?,?,?)')
        ->execute([$listingId,$userId,$source,json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),'pending',$ts]);
    $cid=(int)$pdo->lastInsertId();
    moderation_event($source.'_change',$cid,$userId,'submitted',null,'pending','Listing edit submitted for admin review.',null,['listing_id'=>$listingId]);
    notify_user($userId,'Listing changes submitted','Your changes are waiting for admin review. The approved version remains public until a decision is made.','listing_change_pending','/my-requests');
    return ['id'=>$cid,'reused'=>false,'queue_at'=>$ts];
}



function latest_listing_change(string $source, int $listingId, int $userId): ?array {
    try {
        $st=db()->prepare("SELECT * FROM marketplace_listing_changes WHERE source_type=? AND listing_id=? AND user_id=? AND status<>'superseded' ORDER BY CASE WHEN status='pending' THEN 0 WHEN status='rejected' THEN 1 WHEN status='approved' THEN 2 ELSE 3 END, COALESCE(reviewed_at,created_at) DESC, id DESC LIMIT 1");
        $st->execute([$source,$listingId,$userId]);
        $r=$st->fetch();
        return $r?:null;
    } catch(Throwable $e) { return null; }
}

function add_latest_change_state(array $item, string $source, int $listingId, int $userId, bool $allowed): array {
    if(!$allowed) return $item;
    $c=latest_listing_change($source,$listingId,$userId);
    if(!$c) return $item;
    $item['latest_change_id']=(int)$c['id'];
    $item['latest_change_status']=strtolower((string)($c['status']??''));
    $item['latest_change_reason']=$c['admin_reason']??null;
    $item['latest_change_at']=$c['reviewed_at']??$c['created_at']??null;
    $item['pending_edit_review']=$item['latest_change_status']==='pending';
    return $item;
}

function moderation_preview_item(string $source, array $row, array $payload=[]): array {
    $source=strtolower($source);
    if($source==='places') {
        $base=place_row($row);
        foreach($payload as $k=>$v){
            if($k==='images') $base['images']=is_array($v)?$v:json_array($v);
            elseif($k==='images_json') $base['images']=json_array($v);
            else $base[$k]=$v;
        }
        $base['type']='places';
        $base['title']=$base['name']??($base['title']??'');
        $base['description']=$base['notes']??($base['description']??'');
        return $base;
    }
    if($source==='groups') {
        $base=$row;
        foreach($payload as $k=>$v)$base[$k]=$v;
        $base['type']='groups';
        $base['title']=$base['name']??($base['title']??'');
        $base['description']=$base['notes']??($base['description']??'');
        $base['images']=[];
        $owner=(int)($base['created_by']??0);$base['owner']=$owner?user_profile_row($owner):null;
        return $base;
    }
    $base=listing_row($row);
    foreach($payload as $k=>$v){
        if($k==='images_json') {$base['images']=json_array($v);$base['image_urls']=$base['images'];}
        else $base[$k]=$v;
    }
    return $base;
}

function supersede_other_listing_changes(string $source, int $listingId, int $userId, int $exceptId=0): void {
    try {
        $sql="UPDATE marketplace_listing_changes SET status='superseded' WHERE source_type=? AND listing_id=? AND user_id=? AND status IN ('pending','rejected')";
        $params=[$source,$listingId,$userId];
        if($exceptId>0){$sql.=' AND id<>?';$params[]=$exceptId;}
        db()->prepare($sql)->execute($params);
    } catch(Throwable $e) { error_log('AnswerForU supersede stale change requests failed: '.$e->getMessage()); }
}

function oauth_state_make(string $provider): string {
    $payload = b64url_encode(json_encode(['provider'=>$provider,'ts'=>time(),'nonce'=>bin2hex(random_bytes(8))]));
    $sig = b64url_encode(hash_hmac('sha256',$payload,(string)cfg('app')['jwt_secret'],true));
    return $payload.'.'.$sig;
}
function oauth_state_read(string $state, string $provider): bool {
    $parts=explode('.',$state); if(count($parts)!==2) return false;
    [$payload,$sig]=$parts;
    $expected=b64url_encode(hash_hmac('sha256',$payload,(string)cfg('app')['jwt_secret'],true));
    if(!hash_equals($expected,$sig)) return false;
    $data=json_decode((string)b64url_decode($payload),true);
    return is_array($data) && ($data['provider']??'')===$provider && (int)($data['ts']??0) >= time()-900;
}
function http_remote(string $url, string $method='GET', array $fields=[], array $headers=[]): array {
    $method=strtoupper($method);
    if(function_exists('curl_init')){
        $ch=curl_init();
        if($method==='GET' && $fields){$url.=(str_contains($url,'?')?'&':'?').http_build_query($fields);}
        curl_setopt_array($ch,[CURLOPT_URL=>$url,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>20,CURLOPT_FOLLOWLOCATION=>true]);
        if($method!=='GET'){
            curl_setopt($ch,CURLOPT_CUSTOMREQUEST,$method);
            curl_setopt($ch,CURLOPT_POSTFIELDS,http_build_query($fields));
            $headers[]='Content-Type: application/x-www-form-urlencoded';
        }
        if($headers) curl_setopt($ch,CURLOPT_HTTPHEADER,$headers);
        $raw=curl_exec($ch);$code=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);$err=curl_error($ch);curl_close($ch);
        $data=json_decode((string)$raw,true);
        return ['ok'=>$code>=200&&$code<300,'status'=>$code,'data'=>is_array($data)?$data:[],'raw'=>(string)$raw,'error'=>$err];
    }
    $opts=['http'=>['method'=>$method,'timeout'=>20,'ignore_errors'=>true,'header'=>implode("\r\n",$headers)]];
    if($method!=='GET'){$opts['http']['header'].=($headers?"\r\n":'').'Content-Type: application/x-www-form-urlencoded';$opts['http']['content']=http_build_query($fields);} elseif($fields){$url.=(str_contains($url,'?')?'&':'?').http_build_query($fields);}
    $raw=@file_get_contents($url,false,stream_context_create($opts));$data=json_decode((string)$raw,true);
    return ['ok'=>$raw!==false,'status'=>$raw===false?0:200,'data'=>is_array($data)?$data:[],'raw'=>(string)$raw,'error'=>$raw===false?'request failed':''];
}
function unique_username_from(string $base): string {
    $base=preg_replace('/[^\\pL\\pN_.-]+/u','_',trim($base));$base=trim((string)$base,'_.-');if($base==='')$base='user';$base=mb_substr($base,0,40);
    $candidate=$base;$i=0;$pdo=db();
    while(true){$st=$pdo->prepare('SELECT 1 FROM users WHERE lower(username)=lower(?) LIMIT 1');$st->execute([$candidate]);if(!$st->fetchColumn())return $candidate;$i++;$candidate=mb_substr($base,0,34).'_'.$i;}
}
function oauth_finish_user(string $provider, string $providerUserId, string $email, string $name, string $avatar=''): array {
    $pdo=db();$email=strtolower(trim($email));
    $st=$pdo->prepare('SELECT user_id FROM oauth_accounts WHERE provider=? AND provider_user_id=? LIMIT 1');$st->execute([$provider,$providerUserId]);$uid=(int)($st->fetchColumn()?:0);
    if(!$uid && $email!==''){$st=$pdo->prepare('SELECT id FROM users WHERE lower(email)=lower(?) LIMIT 1');$st->execute([$email]);$uid=(int)($st->fetchColumn()?:0);}
    if(!$uid){
        $base=$name ?: (strstr($email,'@',true) ?: ($provider.'_user'));
        $username=unique_username_from($base);
        if($email===''||!filter_var($email,FILTER_VALIDATE_EMAIL))$email=$provider.'_'.$providerUserId.'@oauth.answerforu.invalid';
        $hash=password_hash(bin2hex(random_bytes(24)),PASSWORD_BCRYPT);$pid=public_id();
        $pdo->prepare("INSERT INTO users (username,email,password_hash,public_id,is_banned,is_admin,role,is_verified,email_verified,created_at,avatar_url) VALUES (?,?,?,?,0,0,'user',0,1,?,?)")->execute([$username,$email,$hash,$pid,now_sql(),$avatar?:null]);
        $uid=(int)$pdo->lastInsertId();ensure_user_profile($uid,$username);
        $pdo->prepare('UPDATE user_profile SET display_name=?,avatar_url=COALESCE(NULLIF(?,\'\'),avatar_url),updated_at=? WHERE user_id=?')->execute([$name?:$username,$avatar,now_sql(),$uid]);
    }
    if(is_sqlite()){
        $pdo->prepare('INSERT INTO oauth_accounts (user_id,provider,provider_user_id,email,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(provider,provider_user_id) DO UPDATE SET user_id=excluded.user_id,email=excluded.email,updated_at=excluded.updated_at')->execute([$uid,$provider,$providerUserId,$email,now_sql(),now_sql()]);
    }else{
        $pdo->prepare('INSERT INTO oauth_accounts (user_id,provider,provider_user_id,email,created_at,updated_at) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),email=VALUES(email),updated_at=VALUES(updated_at)')->execute([$uid,$provider,$providerUserId,$email,now_sql(),now_sql()]);
    }
    $pdo->prepare('UPDATE users SET email_verified=1 WHERE id=?')->execute([$uid]);
    return ['user'=>user_profile_row($uid),'token'=>jwt_make($uid)];
}
function ensure_default_favorite_collection(int $userId): int {
    $pdo=db();$st=$pdo->prepare('SELECT id FROM favorite_collections WHERE user_id=? ORDER BY id ASC LIMIT 1');$st->execute([$userId]);$id=(int)($st->fetchColumn()?:0);if($id)return $id;
    $pdo->prepare('INSERT INTO favorite_collections (user_id,name,created_at,updated_at) VALUES (?,?,?,?)')->execute([$userId,'Favorites',now_sql(),now_sql()]);return (int)$pdo->lastInsertId();
}

// Legacy public profile images are served as binary media, not embedded in
// every JSON owner object. No login is needed to view an already-public avatar.
if (preg_match('#^/media/profile/([1-9][0-9]*)/(avatar|cover)$#', $path, $mediaMatch) && $meth === 'GET') {
    $mediaUserId = (int)$mediaMatch[1];
    $mediaKind = $mediaMatch[2];
    $mediaQuery = $pdo->prepare('SELECT u.avatar_url AS user_avatar, p.avatar_url AS profile_avatar, p.cover_url AS profile_cover FROM users u LEFT JOIN user_profile p ON p.user_id=u.id WHERE u.id=? LIMIT 1');
    $mediaQuery->execute([$mediaUserId]);
    $mediaRow = $mediaQuery->fetch();
    if (!$mediaRow) fail('Image not found', 404);
    $candidates = $mediaKind === 'avatar'
        ? [$mediaRow['user_avatar'] ?? '', $mediaRow['profile_avatar'] ?? '']
        : [$mediaRow['profile_cover'] ?? ''];
    foreach ($candidates as $rawMedia) {
        $rawMedia = trim((string)$rawMedia);
        $comma = strpos($rawMedia, ',');
        if ($comma === false) continue;
        $mediaHeader = substr($rawMedia, 0, $comma);
        if (!preg_match('#^data:image/(jpe?g|png|webp|gif);base64$#i', $mediaHeader, $mediaType)) continue;
        $encoded = substr($rawMedia, $comma + 1);
        if (strlen($encoded) > 8 * 1024 * 1024) continue;
        $binary = base64_decode($encoded, true);
        if ($binary === false || strlen($binary) < 8) continue;
        if (function_exists('getimagesizefromstring') && @getimagesizefromstring($binary) === false) continue;
        $mime = strtolower($mediaType[1]) === 'jpg' ? 'jpeg' : strtolower($mediaType[1]);
        header('Content-Type: image/' . $mime);
        header('Cache-Control: public, max-age=300');
        header('X-Content-Type-Options: nosniff');
        header('Content-Length: ' . strlen($binary));
        echo $binary;
        exit;
    }
    fail('Image not found', 404);
}

// ---------- runtime / mobile API contract ----------
if ($path === '/system/runtime' || $path === '/runtime') {
    response_json([
        'ok'=>true,
        'service'=>'AnswerForU API',
        'environment'=>runtime_environment(),
        'release'=>runtime_release(),
        'api_version'=>runtime_api_version(),
        'db_driver'=>strtolower((string)(cfg('db')['driver'] ?? 'unknown')),
        'data_source'=>runtime_environment()==='production' ? 'central-production-database' : 'persistent-local-environment',
        'persistent_uploads'=>true,
        'time'=>now_sql(),
    ]);
}

// ---------- health ----------
if ($path === '/health/full' && $meth === 'GET') {
    require_admin(); // DB-wide table counts are private, costly internal diagnostics.
    $required = [
        'afu_meta','airports','appeals','carry_listings','carry_messages','carry_requests','carry_reviews','carry_shipments',
        'chat_messages','chat_threads','community_groups','community_help_posts','community_places','community_safety_reports',
        'cvs','follows','glossary_terms','group_reviews','marketplace_listings','marketplace_listing_changes','marketplace_reviews','notifications',
        'place_reviews','post_comment_likes','post_comments','post_likes','posts','products','profile_posts','reports',
        'resource_entities','resource_reviews','resource_votes','reviews','services','site_content','state_resources',
        'support_tickets','user_journey_checklist_progress','user_journey_custom_items','user_journey_profile',
        'user_journey_progress','user_profile','users','verification_requests','favorite_collections','favorite_items','oauth_accounts'
    ];
    $checks = [];
    $missing = [];
    foreach ($required as $table) {
        try {
            $st = $pdo->query("SELECT COUNT(*) AS c FROM `$table`");
            $checks[$table] = ['ok'=>true,'count'=>(int)$st->fetchColumn()];
        } catch (Throwable $e) {
            $checks[$table] = ['ok'=>false,'error'=>'table/query unavailable'];
            $missing[] = $table;
        }
    }
    response_json([
        'ok'=>count($missing)===0,
        'service'=>'AnswerForU PHP API',
        'db_driver'=>cfg('db')['driver'],
        'environment'=>runtime_environment(),
        'release'=>runtime_release(),
        'api_version'=>runtime_api_version(),
        'schema_complete'=>count($missing)===0,
        'tables_checked'=>count($required),
        'missing'=>$missing,
        'tables'=>$checks,
        'time'=>now_sql(),
    ], count($missing)===0 ? 200 : 503);
}
if ($path === '/data/status' && $meth === 'GET') {
    require_admin(); // Aggregated production data inventory is admin-only.
    $tables=['users','community_places','community_groups','marketplace_listings','resource_entities','glossary_terms','state_resources','site_content','airports'];
    $counts=[];foreach($tables as $table){$counts[$table]=(int)$pdo->query('SELECT COUNT(*) FROM `'.$table.'`')->fetchColumn();}
    $st=$pdo->prepare('SELECT content_json FROM site_content WHERE id=? LIMIT 1');$st->execute(['learn_america_v1']);
    $doc=json_decode((string)($st->fetchColumn()?:'null'),true);
    $learn=[];foreach(['life_guides','road_signs','quiz_bank','currency_items'] as $key)$learn[$key]=count(is_array($doc[$key]??null)?$doc[$key]:[]);
    response_json(['ok'=>true,'release'=>runtime_release(),'source'=>'mysql_api_only','db_driver'=>cfg('db')['driver'],'counts'=>$counts,'learn'=>$learn]);
}
if ($path === '/') { response_json(['ok'=>true,'status'=>'ok']); }
if ($path === '/health') {
    // Public probes need only liveness, not version, DB stack or internal fixes.
    $health=['ok'=>true,'status'=>'ok','time'=>now_sql()];
    if ($viewer) {
        $healthUser=user_profile_row((int)$viewer);
        if ($healthUser && (truthy($healthUser['is_admin']??0) || strtolower((string)($healthUser['role']??''))==='admin')) {
            $health=array_merge($health,[
                'service'=>'AnswerForU PHP API','environment'=>runtime_environment(),
                'release'=>runtime_release(),'api_version'=>runtime_api_version(),
                'db_driver'=>cfg('db')['driver'],
                'community_memory_fix'=>'profile-media-proxy-v1',
                'auth_storage_fix'=>'private-runtime-v1',
                'performance_fix'=>'schema-marker-polling-v1',
                'public_feed_fix'=>'public-actor-paged-v1',
                'stage2_security_fix'=>'chat-membership-count-v1',
                'stage3_security_perf'=>'compact-feed-admin-diagnostics-notification-limit-v1',
                'stage4_profile_money'=>'review-activity-coin-visibility-v1',
                'stage7_launch_guard'=>'private-verification-upload-validation-v1',
                'stage10_auth_deletion'=>'http-only-cookie-profile-sanitization-self-service-delete-v1',
            ]);
        }
    }
    response_json($health);
}

// ---------- auth ----------
if ($path === '/auth/register' && $meth === 'POST') {
    $username = trim(clean_string(input('username')));
    $email = strtolower(trim(clean_string(input('email'))));
    $password = (string)input('password','');

    if ($username==='' || $email==='' || $password==='') fail('الاسم والبريد الإلكتروني وكلمة المرور مطلوبون',422);
    if (!filter_var($email,FILTER_VALIDATE_EMAIL)) fail('البريد الإلكتروني غير صحيح',422);
    if (mb_strlen($username) < 2 || mb_strlen($username) > 40) fail('الاسم يجب أن يكون من حرفين إلى 40 حرفًا',422);
    if (strlen($password)<12) fail('كلمة المرور يجب أن تتكون من 12 حرفًا على الأقل',422);
    if (strlen($password)>4096) fail('كلمة المرور طويلة جدًا',422);

    $st=$pdo->prepare('SELECT id FROM users WHERE lower(email)=lower(?) OR lower(username)=lower(?) LIMIT 1');
    $st->execute([$email,$username]);
    if($st->fetch()) fail('البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل',409);

    $verifyToken=bin2hex(random_bytes(24));
    $id=0;
    try {
        if (!$pdo->inTransaction()) $pdo->beginTransaction();
        $hash=password_hash($password,PASSWORD_BCRYPT);
        $pid=public_id();
        $sql="INSERT INTO users (username,email,password_hash,public_id,is_banned,is_admin,role,is_verified,email_verified,email_verification_token,email_verification_sent_at,created_at) VALUES (?,?,?,?,0,0,'user',0,0,?,?,?)";
        $pdo->prepare($sql)->execute([$username,$email,$hash,$pid,$verifyToken,now_sql(),now_sql()]);
        $id=(int)$pdo->lastInsertId();
        ensure_user_profile($id,$username);
        if ($pdo->inTransaction()) $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('AnswerForU register failed: '.$e->getMessage());
        if ((string)$e->getCode()==='23000') fail('البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل',409);
        fail('تعذر إنشاء الحساب حاليًا. حاول مرة أخرى، وإذا استمرت المشكلة تواصل مع الدعم.',500);
    }

    // Mail delivery must never turn a successfully-created account into a visible 500.
    $sent=false;
    try { $sent=send_email_verification($id,$email,$username,$verifyToken); }
    catch (Throwable $e) { error_log('AnswerForU verification mail after register failed: '.$e->getMessage()); }

    $user=user_profile_row($id);
    $payload=afu_auth_payload($id,$user,['email_verification_sent'=>$sent,'email_verified'=>false]);
    if(is_local_runtime()) $payload['dev_email_verification_url']=email_verification_url($verifyToken);
    response_json($payload,201);
}

if ($path === '/auth/login' && $meth === 'POST') {
    $identifier = clean_string(input('email', input('username', input('identifier',''))));
    $password = (string)input('password','');
    if ($identifier==='' || $password==='') fail('Email/username and password are required');
    login_throttle_update(false);

    // Legacy-safe lookup: MySQL's default utf8mb4 collation is case-insensitive,
    // and the old SQLite database contains usernames that differ only by case
    // (for example Andrew / andrew). Do not LIMIT 1 before verifying the hash.
    if (is_sqlite()) {
        $loginSql = 'SELECT * FROM users WHERE lower(email)=lower(?) OR lower(username)=lower(?) ORDER BY CASE WHEN email = ? COLLATE BINARY THEN 0 WHEN username = ? COLLATE BINARY THEN 1 ELSE 2 END, id ASC';
    } else {
        $loginSql = 'SELECT * FROM users WHERE lower(email)=lower(?) OR lower(username)=lower(?) ORDER BY CASE WHEN BINARY email = BINARY ? THEN 0 WHEN BINARY username = BINARY ? THEN 1 ELSE 2 END, id ASC';
    }
    $st=$pdo->prepare($loginSql);
    $st->execute([$identifier,$identifier,$identifier,$identifier]);
    $candidates=$st->fetchAll();
    if(!$candidates) { login_throttle_update(true); fail('Invalid credentials',401); }

    $u=null;
    foreach($candidates as $candidate){
        $hashes=[];
        if(!empty($candidate['password_hash'])) $hashes[]=(string)$candidate['password_hash'];
        if(!empty($candidate['password']) && !in_array((string)$candidate['password'],$hashes,true)) $hashes[]=(string)$candidate['password'];
        foreach($hashes as $hash){
            if(verify_password_compatible($password,$hash)){
                $u=$candidate;
                break 2;
            }
        }
    }
    if(!$u) { login_throttle_update(true); fail('Invalid credentials',401); }
    if(truthy($u['is_banned']??0)) fail(($u['ban_reason']?:'Account is banned'),403,['is_banned'=>true]);

    // After a successful legacy login, transparently migrate the old Node/bcrypt
    // hash to PHP's native bcrypt representation. The user's password is unchanged.
    $stored=(string)($u['password_hash']??'');
    if($stored==='' || str_starts_with($stored,'$2a$') || str_starts_with($stored,'$2b$') || password_needs_rehash($stored,PASSWORD_BCRYPT)){
        $newHash=password_hash($password,PASSWORD_BCRYPT);
        $pdo->prepare('UPDATE users SET password_hash=?, password=NULL WHERE id=?')->execute([$newHash,(int)$u['id']]);
    }

    $id=(int)$u['id'];ensure_user_profile($id,$u['username']);
    $user=user_profile_row($id);
    response_json(afu_auth_payload($id,$user));
}

// Self-service password update; uses the same hash verifier/storage as login.
if ($path === '/auth/change-password' && $meth === 'POST') {
    $userId = current_user_id(true);
    login_throttle_update(false);
    require_once __DIR__ . '/password-change.php';
    try {
        afu_change_own_password(
            $pdo,
            $userId,
            (string)input('currentPassword', ''),
            (string)input('newPassword', ''),
            (string)input('confirmPassword', '')
        );
    } catch (AfuPasswordChangeError $error) {
        if ($error->reason === 'CURRENT_PASSWORD_INCORRECT') login_throttle_update(true);
        fail($error->getMessage(), $error->getCode(), ['code' => $error->reason]);
    }
    response_json(['ok' => true, 'message' => 'Password changed successfully.']);
}

if ($path==='/auth/forgot-password' && $meth==='POST') {
    $email=strtolower(trim(clean_string(input('email',''))));
    // Always return the same public response to avoid account enumeration.
    if ($email!=='' && filter_var($email,FILTER_VALIDATE_EMAIL)) {
        $st=$pdo->prepare('SELECT id,email,username FROM users WHERE lower(email)=lower(?) LIMIT 1');
        $st->execute([$email]);
        $u=$st->fetch();
        if($u){
            $resetToken=bin2hex(random_bytes(32));
            $expires=date('Y-m-d H:i:s', time()+3600);
            $pdo->prepare('UPDATE users SET password_reset_token=?,password_reset_expires_at=? WHERE id=?')->execute([$resetToken,$expires,(int)$u['id']]);
            try { send_password_reset_email((string)$u['email'],(string)$u['username'],$resetToken); }
            catch (Throwable $e) { error_log('AnswerForU forgot-password mail failed: '.$e->getMessage()); }
        }
    }
    response_json(['ok'=>true,'message'=>'If an account exists for that email, a password reset link has been requested.']);
}

if ($path==='/auth/reset-password' && $meth==='GET') {
    $resetToken=trim((string)($_GET['token']??''));
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset password · AnswerForU</title><style>body{font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#0f172a}.card{max-width:440px;margin:8vh auto;background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:28px;box-shadow:0 18px 50px #0f172a14}input,button{box-sizing:border-box;width:100%;padding:13px 14px;border-radius:12px;font-size:16px}input{border:1px solid #cbd5e1;margin:12px 0}button{border:0;background:#0f172a;color:#fff;font-weight:700;cursor:pointer}.msg{margin-top:14px;line-height:1.5}</style></head><body><div class="card"><h1>Choose a new password</h1><p>Use at least 6 characters.</p><form id="f"><input id="p" type="password" minlength="6" required autocomplete="new-password" placeholder="New password"><button type="submit">Reset password</button></form><div id="m" class="msg"></div></div><script defer src="/account-password-reset.js"></script></body></html>';
    exit;
}

if ($path==='/auth/reset-password' && $meth==='POST') {
    $resetToken=trim(clean_string(input('token','')));
    $newPassword=(string)input('password','');
    if($resetToken==='' || strlen($newPassword)<6) fail('Valid reset token and password (6+ chars) are required');
    $st=$pdo->prepare('SELECT id,password_reset_expires_at FROM users WHERE password_reset_token=? LIMIT 1');
    $st->execute([$resetToken]);
    $u=$st->fetch();
    if(!$u || empty($u['password_reset_expires_at']) || strtotime((string)$u['password_reset_expires_at']) < time()) fail('Invalid or expired reset link',400);
    $hash=password_hash($newPassword,PASSWORD_BCRYPT);
    $pdo->prepare('UPDATE users SET password_hash=?,password=NULL,password_reset_token=NULL,password_reset_expires_at=NULL WHERE id=?')->execute([$hash,(int)$u['id']]);
    response_json(['ok'=>true,'message'=>'Password changed successfully.']);
}

if ($path==='/auth/email-verification/status' && $meth==='GET') {
    $me=current_user_id(true);$u=user_profile_row($me);response_json(['ok'=>true,'email_verified'=>truthy($u['email_verified']??0),'email'=>$u['email']??'']);
}
if ($path==='/auth/email-verification/resend' && $meth==='POST') {
    $me=current_user_id(false);$email=strtolower(clean_string(input('email','')));$u=null;
    if($me){$st=$pdo->prepare('SELECT * FROM users WHERE id=? LIMIT 1');$st->execute([$me]);$u=$st->fetch();}
    elseif($email!==''){$st=$pdo->prepare('SELECT * FROM users WHERE lower(email)=lower(?) LIMIT 1');$st->execute([$email]);$u=$st->fetch();}
    $token='';
    if($u && !truthy($u['email_verified']??0)){$token=verification_email_token((int)$u['id']);$sent=send_email_verification((int)$u['id'],(string)$u['email'],(string)$u['username'],$token);}else{$sent=false;}
    $payload=['ok'=>true,'sent'=>$sent,'message'=>'If the account exists and is not verified, a confirmation email was requested.'];
    if($token!=='' && is_local_runtime()) $payload['dev_email_verification_url']=email_verification_url($token);
    response_json($payload);
}
if ($path==='/auth/verify-email' && $meth==='GET') {
    $token=clean_string($_GET['token']??'');if($token==='')fail('Verification token required');
    $st=$pdo->prepare('SELECT id FROM users WHERE email_verification_token=? LIMIT 1');$st->execute([$token]);$uid=(int)($st->fetchColumn()?:0);
    if(!$uid)fail('Invalid or expired verification link',400);
    $pdo->prepare('UPDATE users SET email_verified=1,email_verification_token=NULL WHERE id=?')->execute([$uid]);
    $dest=app_base_url().'/auth?email_verified=1';header('Location: '.$dest,true,302);exit;
}

// Native sign-in: Google ID token -> existing AnswerForU account -> native bearer JWT.
// The Android application passes an ID token obtained via Google's native SDK.
// Trust only Google's token verification over TLS and configured OAuth client audiences.
if ($path==='/auth/oauth/google/mobile' && $meth==='POST') {
    login_throttle_update(false);
    if (!oauth_enabled('google')) fail('Google sign-in is not configured',503);
    $raw=(string)input('id_token','');
    if ($raw==='' || strlen($raw)>12000) fail('A valid Google ID token is required',422);
    $config=oauth_provider_config('google');
    $clientIds=array_filter(array_map('trim',array_merge(
        [(string)($config['client_id']??'')],
        (array)($config['mobile_client_ids']??[])
    )));
    if (!$clientIds) fail('Google OAuth client IDs are missing',503);
    $verified=http_remote('https://oauth2.googleapis.com/tokeninfo','GET',['id_token'=>$raw]);
    $claims=$verified['data']??[];
    if (!$verified['ok'] || !is_array($claims) ||
        !in_array((string)($claims['aud']??''),$clientIds,true) ||
        !in_array((string)($claims['iss']??''),['accounts.google.com','https://accounts.google.com'],true) ||
        (int)($claims['exp']??0)<=time() ||
        !in_array(strtolower((string)($claims['email_verified']??'')),['true','1'],true) ||
        empty($claims['sub']) || !filter_var($claims['email']??'',FILTER_VALIDATE_EMAIL)) {
        login_throttle_update(true);
        fail('Google sign-in verification failed',401);
    }
    $result=oauth_finish_user('google',(string)$claims['sub'],(string)$claims['email'],
        (string)($claims['name']??''),(string)($claims['picture']??''));
    header('Cache-Control: no-store');
    response_json(['ok'=>true,'token'=>$result['token'],'user'=>$result['user']]);
}

if ($path==='/auth/oauth/config' && $meth==='GET') {
    response_json(['google'=>['enabled'=>oauth_enabled('google'),'redirect_uri'=>app_base_url().'/api/auth/oauth/google/callback'],'facebook'=>['enabled'=>oauth_enabled('facebook'),'redirect_uri'=>app_base_url().'/api/auth/oauth/facebook/callback']]);
}
if ($path==='/auth/oauth/diagnostics' && $meth==='GET') {
    if(is_production_runtime())require_admin(); // OAuth diagnostics are not public in production.
    $base = app_base_url();
    $local = is_local_runtime();
    response_json([
        'ok'=>true,
        'base_url'=>$base,
        'local_runtime'=>$local,
        'google'=>[
            'enabled'=>oauth_enabled('google'),
            'client_id'=>oauth_enabled('google') ? (string)(oauth_provider_config('google')['client_id'] ?? '') : '',
            'redirect_uri'=>$base.'/api/auth/oauth/google/callback',
            'google_console_authorized_redirect_uri'=>$base.'/api/auth/oauth/google/callback',
            'google_console_authorized_javascript_origin'=>$base,
        ],
        'facebook'=>[
            'enabled'=>oauth_enabled('facebook'),
            'app_id'=>oauth_enabled('facebook') ? (string)(oauth_provider_config('facebook')['client_id'] ?? '') : '',
            'redirect_uri'=>$base.'/api/auth/oauth/facebook/callback',
            'meta_valid_oauth_redirect_uri'=>$base.'/api/auth/oauth/facebook/callback',
            'note'=>$local ? 'Use localhost (not 127.0.0.1) and keep the Meta app in Development mode for HTTP localhost testing.' : 'Production must use HTTPS and the exact answerforu.com callback configured in Meta.',
        ],
        'production_required'=>[
            'base_url'=>'https://answerforu.com',
            'google_redirect_uri'=>'https://answerforu.com/api/auth/oauth/google/callback',
            'facebook_redirect_uri'=>'https://answerforu.com/api/auth/oauth/facebook/callback',
            'privacy_policy_url'=>'https://answerforu.com/privacy/',
            'terms_url'=>'https://answerforu.com/terms/',
            'data_deletion_url'=>'https://answerforu.com/data-deletion/',
        ],
    ]);
}
if (preg_match('#^/auth/oauth/(google|facebook)/start$#',$path,$om) && $meth==='GET') {
    $provider=$om[1];if(!oauth_enabled($provider))fail(ucfirst($provider).' login is not configured',503);
    $c=oauth_provider_config($provider);$state=oauth_state_make($provider);$redirect=app_base_url().'/api/auth/oauth/'.$provider.'/callback';
    if($provider==='google'){
        $auth=$c['authorize_url']??'https://accounts.google.com/o/oauth2/v2/auth';
        $qs=['client_id'=>$c['client_id'],'redirect_uri'=>$redirect,'response_type'=>'code','scope'=>$c['scope']??'openid email profile','state'=>$state,'access_type'=>'online','prompt'=>'select_account'];
    } else {
        $auth=$c['authorize_url']??'https://www.facebook.com/v26.0/dialog/oauth';
        $qs=['client_id'=>$c['client_id'],'redirect_uri'=>$redirect,'response_type'=>'code','scope'=>$c['scope']??'email,public_profile','state'=>$state];
    }
    header('Location: '.$auth.'?'.http_build_query($qs),true,302);exit;
}
if (preg_match('#^/auth/oauth/(google|facebook)/callback$#',$path,$om) && $meth==='GET') {
    $provider=$om[1];$code=clean_string($_GET['code']??'');$state=clean_string($_GET['state']??'');if($code===''||!oauth_state_read($state,$provider))fail('Invalid OAuth callback',400);
    $c=oauth_provider_config($provider);if(!oauth_enabled($provider))fail('OAuth provider not configured',503);$redirect=app_base_url().'/api/auth/oauth/'.$provider.'/callback';
    if($provider==='google'){
        $tok=http_remote($c['token_url']??'https://oauth2.googleapis.com/token','POST',['code'=>$code,'client_id'=>$c['client_id'],'client_secret'=>$c['client_secret'],'redirect_uri'=>$redirect,'grant_type'=>'authorization_code']);
        $access=(string)($tok['data']['access_token']??'');if($access==='')fail('Google token exchange failed',502);
        $me=http_remote($c['userinfo_url']??'https://openidconnect.googleapis.com/v1/userinfo','GET',[],['Authorization: Bearer '.$access]);$d=$me['data'];
        $result=oauth_finish_user('google',(string)($d['sub']??''),(string)($d['email']??''),(string)($d['name']??''),(string)($d['picture']??''));
    } else {
        $tok=http_remote($c['token_url']??'https://graph.facebook.com/v26.0/oauth/access_token','GET',['client_id'=>$c['client_id'],'client_secret'=>$c['client_secret'],'redirect_uri'=>$redirect,'code'=>$code]);
        $access=(string)($tok['data']['access_token']??'');if($access==='')fail('Facebook token exchange failed',502);
        $me=http_remote($c['userinfo_url']??'https://graph.facebook.com/me','GET',['fields'=>'id,name,email,picture.type(large)','access_token'=>$access]);$d=$me['data'];$avatar=(string)($d['picture']['data']['url']??'');
        $result=oauth_finish_user('facebook',(string)($d['id']??''),(string)($d['email']??''),(string)($d['name']??''),$avatar);
    }
    afu_browser_cookie((string)$result['token']);
    $dest=app_base_url().'/auth?oauth_success=1&oauth='.rawurlencode($provider);header('Referrer-Policy: no-referrer');header('Location: '.$dest,true,302);exit;
}


// Browser-only session upgrade and logout. Native bearer auth remains unchanged.
if ($path==='/auth/session/upgrade' && $meth==='POST') {
    $id=current_user_id(true);
    $user=user_profile_row($id);
    $token=jwt_make($id);
    afu_browser_cookie($token);
    response_json(['ok'=>true,'token'=>'cookie-session','user'=>$user]);
}
if ($path==='/auth/logout' && $meth==='POST') {
    // Logout never deletes account data or invalidates native app sessions.
    afu_browser_cookie('');
    response_json(['ok'=>true]);
}

// Account deletion: email proof for OAuth/passwordless users, or password
// proof for accounts with a password. GET links NEVER delete automatically.
if ($path==='/auth/account/deletion-request' && $meth==='POST') {
    $id=current_user_id(true);
    $st=$pdo->prepare('SELECT username,email,is_admin FROM users WHERE id=? LIMIT 1');
    $st->execute([$id]);$user=$st->fetch(PDO::FETCH_ASSOC);
    if (!$user || truthy($user['is_admin']??0)) fail('This account cannot be deleted here',403);
    afu_deletion_table();
    $last=$pdo->prepare('SELECT created_at FROM afu_account_deletion_requests WHERE user_id=? ORDER BY id DESC LIMIT 1');
    $last->execute([$id]);$lastTime=$last->fetchColumn();
    if($lastTime && strtotime((string)$lastTime)>time()-600) fail('Please wait 10 minutes before requesting another link',429);
    $token=bin2hex(random_bytes(32));
    $pdo->prepare('INSERT INTO afu_account_deletion_requests (user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?)')
        ->execute([$id,hash('sha256',$token),date('Y-m-d H:i:s',time()+1800),now_sql()]);
    if(!afu_send_deletion_email($id,(string)$user['email'],(string)$user['username'],$token)) {
        $pdo->prepare('DELETE FROM afu_account_deletion_requests WHERE user_id=? AND token_hash=?')->execute([$id,hash('sha256',$token)]);
        fail('Could not send confirmation email. You can confirm with your password instead.',503);
    }
    response_json(['ok'=>true,'message'=>'Check your account email and confirm account deletion within 30 minutes.']);
}
if ($path==='/auth/account/deletion-confirm' && $meth==='GET') {
    header('Content-Type: text/html; charset=UTF-8');
    header('Referrer-Policy: no-referrer');
    header('Cache-Control: no-store');
    header('X-Frame-Options: DENY');
    $token=trim((string)($_GET['token']??''));
    if(!preg_match('/^[a-f0-9]{64}$/D',$token)) fail('Invalid confirmation link',400);
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirm deletion | AnswerForU</title><style>body{font-family:system-ui;background:#f1f5f9;color:#0f172a;padding:3rem 1rem}.card{max-width:520px;margin:auto;background:#fff;border-radius:18px;padding:28px;box-shadow:0 2px 10px #0001}button{background:#b91c1c;color:white;padding:13px 18px;border:0;border-radius:10px;cursor:pointer}</style></head><body><section class="card"><h1>Delete your AnswerForU account?</h1><p>This permanently removes your account and related data. This action cannot be undone.</p><button type="button" id="confirm">Yes, delete my account</button><p id="message" role="status"></p></section><script defer src="/account-deletion-confirm.js"></script></body></html>';
    exit;
}
if ($path==='/auth/account/deletion-confirm' && $meth==='POST') {
    afu_deletion_table();
    $token=trim((string)input('token',''));
    if(!preg_match('/^[a-f0-9]{64}$/D',$token)) fail('Invalid confirmation code',400);
    $st=$pdo->prepare('SELECT user_id,expires_at FROM afu_account_deletion_requests WHERE token_hash=? LIMIT 1');
    $st->execute([hash('sha256',$token)]);$req=$st->fetch(PDO::FETCH_ASSOC);
    if(!$req || strtotime((string)$req['expires_at'])<time()) fail('Confirmation link expired or invalid',400);
    afu_delete_account_data((int)$req['user_id']);
    $pdo->prepare('DELETE FROM afu_account_deletion_requests WHERE user_id=?')->execute([(int)$req['user_id']]);
    afu_browser_cookie('');
    response_json(['ok'=>true,'deleted'=>true]);
}
if ($path==='/auth/account' && $meth==='DELETE') {
    $id=current_user_id(true);
    $password=(string)input('password','');$confirm=(string)input('confirmation','');
    if($confirm!=='DELETE' || $password==='') fail('Password and DELETE confirmation required',400);
    $st=$pdo->prepare('SELECT password_hash,password,is_admin FROM users WHERE id=? LIMIT 1');
    $st->execute([$id]);$u=$st->fetch(PDO::FETCH_ASSOC);
    if(!$u || truthy($u['is_admin']??0)) fail('This account cannot be deleted here',403);
    login_throttle_update(false);
    $valid=false;
    foreach([(string)($u['password_hash']??''),(string)($u['password']??'')] as $h){
        if($h!=='' && verify_password_compatible($password,$h)) {$valid=true;break;}
    }
    if(!$valid) {login_throttle_update(true);fail('Incorrect password',403);}
    afu_delete_account_data($id);afu_browser_cookie('');
    response_json(['ok'=>true,'deleted'=>true]);
}

// ---------- current user/profile ----------
if (in_array($path,['/me','/users/me','/profile/me','/auth/me','/profiles/me','/user/me','/user/profile/me'],true) && $meth==='GET') {
    $id=current_user_id(true);$u=user_profile_row($id);if(!$u) fail('User not found',404);
    // Keep the direct profile shape used by most pages while also exposing `user`
    // for older frontend consumers that read response.user.is_banned, etc.
    response_json(array_merge($u, ['user'=>$u, 'profile'=>$u, 'data'=>$u]));
}

if (($path==='/profile/me' || $path==='/users/me') && in_array($meth,['PUT','PATCH','POST'],true)) {
    $id=current_user_id(true); ensure_user_profile($id);$d=input_all();
    foreach (['display_name'=>80,'bio'=>1500,'location'=>180,'phone'=>80,'whatsapp'=>80,'website'=>300] as $field=>$max) { if(array_key_exists($field,$d)) $d[$field]=afu_profile_plain($d[$field],$max); }
    if (array_key_exists('website',$d)) $d['website']=afu_safe_profile_url($d['website']);
    $avatar=upload_one('avatar','avatars');$cover=upload_one('cover','covers');

    if(array_key_exists('username',$d)){
        $newUsername=afu_profile_plain($d['username'],40);if($newUsername==='')fail('Username cannot be empty');
        $st=$pdo->prepare('SELECT username,username_changed_at FROM users WHERE id=? LIMIT 1');$st->execute([$id]);$cur=$st->fetch();$oldUsername=(string)($cur['username']??'');
        if($newUsername!==$oldUsername){
            if(!empty($cur['username_changed_at']))fail('Username can only be changed once',409,['code'=>'USERNAME_CHANGE_USED']);
            $st=$pdo->prepare('SELECT id FROM users WHERE id<>? AND lower(username)=lower(?) LIMIT 1');$st->execute([$id,$newUsername]);if($st->fetch())fail('Username is already taken',409);
            $pdo->prepare('UPDATE users SET username=?,username_changed_at=? WHERE id=?')->execute([$newUsername,now_sql(),$id]);
            $pdo->prepare('UPDATE user_profile SET username=?,updated_at=? WHERE user_id=?')->execute([$newUsername,now_sql(),$id]);
        }
    }

    $allowed=['display_name','bio','location','phone','whatsapp','website'];$sets=[];$vals=[];
    foreach($allowed as $k){if(array_key_exists($k,$d)){$sets[]="$k=?";$vals[]=clean_string($d[$k]);}}
    if($avatar){$sets[]='avatar_url=?';$vals[]=$avatar;$pdo->prepare('UPDATE users SET avatar_url=? WHERE id=?')->execute([$avatar,$id]);}
    if($cover){$sets[]='cover_url=?';$vals[]=$cover;}
    if($sets){$sets[]='updated_at=?';$vals[]=now_sql();$vals[]=$id;$pdo->prepare('UPDATE user_profile SET '.implode(',',$sets).' WHERE user_id=?')->execute($vals);}
    if(array_key_exists('email',$d)||array_key_exists('address',$d)){
        $us=[];$uv=[];
        if(isset($d['email'])){$newEmail=strtolower(clean_string($d['email']));if(!filter_var($newEmail,FILTER_VALIDATE_EMAIL))fail('Invalid email');$st=$pdo->prepare('SELECT id FROM users WHERE id<>? AND lower(email)=lower(?) LIMIT 1');$st->execute([$id,$newEmail]);if($st->fetch())fail('Email already used',409);$us[]='email=?';$uv[]=$newEmail;$us[]='email_verified=0';$us[]='email_verification_token=NULL';}
        if(isset($d['address'])){$us[]='address=?';$uv[]=clean_string($d['address']);}
        if($us){$uv[]=$id;$pdo->prepare('UPDATE users SET '.implode(',',$us).' WHERE id=?')->execute($uv);}
    }
    response_json(user_profile_row($id));
}

// profile media aliases
if (preg_match('#^/profile/me/(avatar|cover)$#',$path,$mm) && in_array($meth,['POST','PUT','DELETE'],true)) {
    $id=current_user_id(true);$kind=$mm[1];ensure_user_profile($id);
    if($meth==='DELETE'){
        $col=$kind==='avatar'?'avatar_url':'cover_url';$pdo->prepare("UPDATE user_profile SET $col=NULL,updated_at=? WHERE user_id=?")->execute([now_sql(),$id]);
        if($kind==='avatar')$pdo->prepare('UPDATE users SET avatar_url=NULL WHERE id=?')->execute([$id]);
    } else {
        $url=upload_one($kind,$kind==='avatar'?'avatars':'covers'); if(!$url) fail('No file uploaded');
        $col=$kind==='avatar'?'avatar_url':'cover_url';$pdo->prepare("UPDATE user_profile SET $col=?,updated_at=? WHERE user_id=?")->execute([$url,now_sql(),$id]);
        if($kind==='avatar')$pdo->prepare('UPDATE users SET avatar_url=? WHERE id=?')->execute([$url,$id]);
    }
    response_json(user_profile_row($id));
}

// User lookups and profiles.
if (preg_match('#^/(?:profile|profiles|users|user)/([^/]+)(?:/profile)?$#',$path,$mm) && $meth==='GET') {
    $lookupKey=rawurldecode($mm[1]);
    $u=user_lookup($lookupKey);
    if(!$u && ctype_digit($lookupKey)) $u=legacy_deleted_user_profile((int)$lookupKey);
    if(!$u) fail('User not found',404);
    response_json(public_user_profile($u));
}
if (preg_match('#^/users/(?:by-username|username)/([^/]+)$#',$path,$mm) && $meth==='GET') {
    $u=user_lookup(rawurldecode($mm[1]));if(!$u) fail('User not found',404);response_json(public_user_profile($u));
}

// Follow toggle.
if ((preg_match('#^/profile/([^/]+)/follow$#',$path,$mm)||preg_match('#^/follow/([^/]+)$#',$path,$mm)) && in_array($meth,['POST','DELETE'],true)) {
    $me=current_user_id(true);$target=user_lookup(rawurldecode($mm[1]));if(!$target) fail('User not found',404);$tid=(int)$target['id'];if($tid===$me)fail('Cannot follow yourself');
    $st=$pdo->prepare('SELECT 1 FROM follows WHERE follower_id=? AND following_id=?');$st->execute([$me,$tid]);$exists=(bool)$st->fetchColumn();
    if($meth==='DELETE'||$exists){$pdo->prepare('DELETE FROM follows WHERE follower_id=? AND following_id=?')->execute([$me,$tid]);$following=false;}
    else{$pdo->prepare('INSERT INTO follows (follower_id,following_id,created_at) VALUES (?,?,?)')->execute([$me,$tid,now_sql()]);$following=true;}
    response_json(['ok'=>true,'following'=>$following,'is_following'=>$following]);
}

// Strict server-side paging. Every collection is bounded on the SQL side.
function afu_page(): array {
    $page=max(1,min(100000,(int)($_GET['page']??1)));
    $limit=max(1,min(50,(int)($_GET['limit']??20)));
    return [$page,$limit,($page-1)*$limit];
}
function afu_pagination(int $page,int $limit,int $total): array {
    return ['page'=>$page,'limit'=>$limit,'total'=>$total,'total_pages'=>max(1,(int)ceil($total/$limit)),'has_more'=>$page*$limit<$total];
}

// ---------- posts/feed ----------
if ($path==='/posts' && $meth==='GET') {
    $uid=$_GET['userId']??$_GET['user_id']??null;$category=clean_string($_GET['category']??'');$params=[];$conds=[];
    if($uid!==null&&$uid!==''){$target=user_lookup((string)$uid);$id=$target?(int)$target['id']:(int)$uid;$conds[]='user_id=?';$params[]=$id;}
    if($category!==''&&$category!=='all'&&$category!=='saved'){$conds[]='category=?';$params[]=$category;}
    $where=$conds?' WHERE '.implode(' AND ',$conds):'';
    [$page,$limit,$offset]=afu_page();
    $st=$pdo->prepare("SELECT COUNT(*) FROM posts$where");$st->execute($params);$total=(int)$st->fetchColumn();
    $sort=($_GET['order']??'newest')==='oldest'?'ASC':'DESC';
    $sql="SELECT * FROM posts$where ORDER BY created_at $sort, id $sort LIMIT $limit OFFSET $offset";
    $st=$pdo->prepare($sql);$st->execute($params);$rows=array_map(fn($r)=>post_row($r,$viewer),$st->fetchAll());
    // Legacy clients still receive an array. New web/mobile clients can opt into paging metadata.
    if(($_GET['paged']??'')==='1')response_json(['posts'=>$rows,'items'=>$rows,'pagination'=>afu_pagination($page,$limit,$total)]);
    response_json($rows);
}
if (preg_match('#^/(?:users|profile)/([^/]+)/posts$#',$path,$mm) && $meth==='GET') {
    $u=user_lookup(rawurldecode($mm[1]));if(!$u)fail('User not found',404);
    [$page,$limit,$offset]=afu_page();
    $st=$pdo->prepare('SELECT COUNT(*) FROM posts WHERE user_id=?');$st->execute([$u['id']]);$total=(int)$st->fetchColumn();
    $st=$pdo->prepare("SELECT * FROM posts WHERE user_id=? ORDER BY created_at DESC, id DESC LIMIT $limit OFFSET $offset");$st->execute([$u['id']]);
    $rows=array_map(fn($r)=>post_row($r,$viewer),$st->fetchAll());
    response_json(['posts'=>$rows,'items'=>$rows,'data'=>$rows,'pagination'=>afu_pagination($page,$limit,$total)]);
}
if ($path==='/posts' && $meth==='POST') {
    $me=current_user_id(true);$content=clean_string(input('content',input('text','')));if($content==='')fail('Write something');$cat=clean_string(input('category','general'),'general');
    $media=upload_many('images','posts'); if(!$media){$media=upload_many('media','posts');}
    $pdo->prepare('INSERT INTO posts (user_id,content,category,created_at,media_urls,media_url) VALUES (?,?,?,?,?,?)')->execute([$me,$content,$cat,now_sql(),json_encode($media,JSON_UNESCAPED_SLASHES),$media[0]??null]);
    $id=(int)$pdo->lastInsertId();$st=$pdo->prepare('SELECT * FROM posts WHERE id=?');$st->execute([$id]);response_json(post_row($st->fetch(),$me),201);
}
if (preg_match('#^/(?:posts|post)/([^/]+)$#',$path,$mm) && $meth==='GET') {
    $id=(int)preg_replace('/\D+/','',$mm[1]);$st=$pdo->prepare('SELECT * FROM posts WHERE id=? LIMIT 1');$st->execute([$id]);$r=$st->fetch();if(!$r)fail('Post not found',404);response_json(post_row($r,$viewer));
}
if (preg_match('#^/(?:posts|post)/([^/]+)$#',$path,$mm) && in_array($meth,['PUT','PATCH'],true)) {
    $me=current_user_id(true);$id=(int)preg_replace('/\D+/','',$mm[1]);$st=$pdo->prepare('SELECT * FROM posts WHERE id=?');$st->execute([$id]);$r=$st->fetch();if(!$r)fail('Post not found',404);if((int)$r['user_id']!==$me&&!truthy(user_profile_row($me)['is_admin']??0))fail('Forbidden',403);
    $content=clean_string(input('content',input('text',$r['content'])));$cat=clean_string(input('category',$r['category']));$pdo->prepare('UPDATE posts SET content=?,category=? WHERE id=?')->execute([$content,$cat,$id]);$st->execute([$id]);response_json(post_row($st->fetch(),$me));
}
if ((preg_match('#^/(?:posts|post|delete-post|posts/delete)/([^/]+)$#',$path,$mm)) && $meth==='DELETE') {
    $me=current_user_id(true);$id=(int)preg_replace('/\D+/','',$mm[1]);$st=$pdo->prepare('SELECT user_id FROM posts WHERE id=?');$st->execute([$id]);$owner=$st->fetchColumn();if($owner===false)fail('Post not found',404);$meu=user_profile_row($me);if((int)$owner!==$me&&!truthy($meu['is_admin']??0))fail('Forbidden',403);
    $pdo->prepare('DELETE FROM post_comment_likes WHERE comment_id IN (SELECT id FROM post_comments WHERE post_id=?)')->execute([$id]);$pdo->prepare('DELETE FROM post_comments WHERE post_id=?')->execute([$id]);$pdo->prepare('DELETE FROM post_likes WHERE post_id=?')->execute([$id]);$pdo->prepare('DELETE FROM posts WHERE id=?')->execute([$id]);response_json(['ok'=>true,'deleted'=>true]);
}
if (preg_match('#^/posts/([^/]+)/like$#',$path,$mm) && $meth==='POST') {
    $me=current_user_id(true);$id=(int)$mm[1];$st=$pdo->prepare('SELECT id FROM post_likes WHERE post_id=? AND user_id=?');$st->execute([$id,$me]);$like=$st->fetchColumn();if($like){$pdo->prepare('DELETE FROM post_likes WHERE id=?')->execute([$like]);$liked=false;}else{$pdo->prepare('INSERT INTO post_likes (post_id,user_id) VALUES (?,?)')->execute([$id,$me]);$liked=true;}$st=$pdo->prepare('SELECT COUNT(*) FROM post_likes WHERE post_id=?');$st->execute([$id]);response_json(['ok'=>true,'liked'=>$liked,'is_liked'=>$liked,'likes_count'=>(int)$st->fetchColumn()]);
}

// Comments aliases.
if ((preg_match('#^/posts/([^/]+)/comments$#',$path,$mm)||preg_match('#^/comments/post/([^/]+)$#',$path,$mm)||preg_match('#^/post_comments/([^/]+)$#',$path,$mm)) && $meth==='GET') {
    $pid=(int)$mm[1];
    $st=$pdo->prepare('SELECT * FROM post_comments WHERE post_id=? ORDER BY id ASC');
    $st->execute([$pid]);
    $rows=[];
    foreach($st->fetchAll() as $r){
        $u=user_profile_row((int)$r['user_id']) ?: [];
        $r['id']=(int)$r['id'];
        $r['comment_id']=$r['id'];
        $r['text']=$r['comment'];
        $r['content']=$r['comment'];
        // IMPORTANT: legacy React expects these as strings, not a whole user object.
        $r['user_name']=$u['username']??'User';
        $r['username']=$u['username']??'User';
        $r['author_name']=$u['display_name']??($u['username']??'User');
        $r['user_avatar']=$u['avatar_url']??'';
        $r['author_avatar']=$u['avatar_url']??'';
        $r['is_verified']=truthy($u['is_verified']??0)?1:0;
        $r['author_verified']=truthy($u['is_verified']??0);
        $r['user']=public_user_profile($u);
        // Keep author text-compatible. Older profile code falls back to c.author as a label.
        $r['author']=$r['author_name'];
        $x=$pdo->prepare('SELECT COUNT(*) FROM post_comment_likes WHERE comment_id=?');
        $x->execute([$r['id']]);
        $likes=(int)$x->fetchColumn();
        $r['likes_count']=$likes;
        $r['likeCount']=$likes;
        $liked=false;
        if($viewer){$q=$pdo->prepare('SELECT 1 FROM post_comment_likes WHERE comment_id=? AND user_id=? LIMIT 1');$q->execute([$r['id'],$viewer]);$liked=(bool)$q->fetchColumn();}
        $r['likedByMe']=$liked;
        $r['is_liked']=$liked;
        $rows[]=$r;
    }
    // Original Node feed/comment API returns a plain array.
    response_json($rows);
}
if (($path==='/comments'||preg_match('#^/posts/([^/]+)/comments$#',$path,$mm)) && $meth==='POST') {
    $me=current_user_id(true);$pid=isset($mm[1])?(int)$mm[1]:(int)input('post_id',input('postId',0));$text=clean_string(input('comment',input('text',input('body',input('content','')))));if(!$pid||$text==='')fail('Post and comment required');$parent=input('parent_comment_id',input('parent_id',input('parentId',null)));$pdo->prepare('INSERT INTO post_comments (post_id,user_id,comment,created_at,parent_comment_id) VALUES (?,?,?,?,?)')->execute([$pid,$me,$text,now_sql(),$parent?:null]);$id=(int)$pdo->lastInsertId();$u=user_profile_row($me)?:[];$created=now_sql();$row=['id'=>$id,'comment_id'=>$id,'post_id'=>$pid,'user_id'=>$me,'parent_comment_id'=>$parent?:null,'parent_id'=>$parent?:null,'comment'=>$text,'text'=>$text,'content'=>$text,'created_at'=>$created,'user_name'=>$u['username']??'User','username'=>$u['username']??'User','author_name'=>$u['display_name']??($u['username']??'User'),'author'=>$u['display_name']??($u['username']??'User'),'user_avatar'=>$u['avatar_url']??'','author_avatar'=>$u['avatar_url']??'','author_verified'=>truthy($u['is_verified']??0),'likes_count'=>0,'likeCount'=>0,'likedByMe'=>false,'is_liked'=>false,'user'=>public_user_profile($u)];response_json(['ok'=>true,'id'=>$id,'comment'=>$row,'item'=>$row,'data'=>$row],201);
}
if ((preg_match('#^/(?:comments|comment|delete-comment)/([^/]+)$#',$path,$mm)||preg_match('#^/posts/[^/]+/comments/([^/]+)$#',$path,$mm)) && $meth==='DELETE') {
    $me=current_user_id(true);$id=(int)$mm[1];$st=$pdo->prepare('SELECT user_id FROM post_comments WHERE id=?');$st->execute([$id]);$owner=$st->fetchColumn();if($owner===false)fail('Comment not found',404);if((int)$owner!==$me&&!truthy(user_profile_row($me)['is_admin']??0))fail('Forbidden',403);$pdo->prepare('DELETE FROM post_comment_likes WHERE comment_id=?')->execute([$id]);$pdo->prepare('DELETE FROM post_comments WHERE id=?')->execute([$id]);response_json(['ok'=>true]);
}
if ((preg_match('#^/(?:comments|comment)/([^/]+)/like$#',$path,$mm)||preg_match('#^/like/comment/([^/]+)$#',$path,$mm)||preg_match('#^/posts/[^/]+/comments/([^/]+)/like$#',$path,$mm)) && $meth==='POST') {
    $me=current_user_id(true);$id=(int)$mm[1];$st=$pdo->prepare('SELECT id FROM post_comment_likes WHERE comment_id=? AND user_id=?');$st->execute([$id,$me]);$x=$st->fetchColumn();if($x){$pdo->prepare('DELETE FROM post_comment_likes WHERE id=?')->execute([$x]);$liked=false;}else{$pdo->prepare('INSERT INTO post_comment_likes (comment_id,user_id) VALUES (?,?)')->execute([$id,$me]);$liked=true;}response_json(['ok'=>true,'liked'=>$liked]);
}

// Quick profile listing counts: no card payloads; same visibility rules as /community-listings.
if (preg_match('#^/users/([^/]+)/listing-count$#',$path,$mm) && $meth==='GET') {
    $target=user_lookup(rawurldecode($mm[1]));if(!$target)fail('User not found',404);$uid=(int)$target['id'];
    $canSeePrivate=$viewer && ((int)$viewer===$uid || truthy(user_profile_row((int)$viewer)['is_admin']??0));
    $marketPublic=$canSeePrivate?'':" AND (is_active=1 OR is_active IS NULL) AND COALESCE(status,'approved')='approved'";
    $communityPublic=$canSeePrivate?'':" AND (status IS NULL OR status IN ('approved','active','published'))";
    $market=$pdo->prepare('SELECT COUNT(*) FROM marketplace_listings WHERE (user_id=? OR created_by=?)'.$marketPublic);
    $market->execute([$uid,$uid]);$marketN=(int)$market->fetchColumn();
    $places=$pdo->prepare('SELECT COUNT(*) FROM community_places WHERE created_by=?'.$communityPublic);
    $places->execute([$uid]);$placesN=(int)$places->fetchColumn();
    $groups=$pdo->prepare('SELECT COUNT(*) FROM community_groups WHERE created_by=?'.$communityPublic);
    $groups->execute([$uid]);$groupsN=(int)$groups->fetchColumn();
    response_json(['total'=>$marketN+$placesN+$groupsN,'marketplace'=>$marketN,'places'=>$placesN,'groups'=>$groupsN]);
}
// Profile listings: one bounded SQL query across three sources, not multiple public full-list scans.
if (preg_match('#^/users/([^/]+)/community-listings$#',$path,$mm) && $meth==='GET') {
    $target=user_lookup(rawurldecode($mm[1]));if(!$target)fail('User not found',404);$uid=(int)$target['id'];
    $canSeePrivate=$viewer && ((int)$viewer===$uid || truthy(user_profile_row((int)$viewer)['is_admin']??0));
    [$page,$limit,$offset]=afu_page();
    $publicMarket=$canSeePrivate?'':" AND (is_active=1 OR is_active IS NULL) AND COALESCE(status,'approved')='approved'";
    $publicCommunity=$canSeePrivate?'':" AND (status IS NULL OR status IN ('approved','active','published'))";
    $sql="SELECT 'marketplace' AS src,id,created_at FROM marketplace_listings WHERE (user_id=? OR created_by=?)$publicMarket
          UNION ALL SELECT 'places' AS src,id,created_at FROM community_places WHERE created_by=?$publicCommunity
          UNION ALL SELECT 'groups' AS src,id,created_at FROM community_groups WHERE created_by=?$publicCommunity";
    $params=[$uid,$uid,$uid,$uid];
    $ct=$pdo->prepare("SELECT COUNT(*) FROM ($sql) srcrows");$ct->execute($params);$total=(int)$ct->fetchColumn();
    $st=$pdo->prepare("SELECT src,id FROM ($sql) srcrows ORDER BY created_at DESC,src ASC,id DESC LIMIT $limit OFFSET $offset");$st->execute($params);
    $out=[];
    $market=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=?');
    $places=$pdo->prepare('SELECT * FROM community_places WHERE id=?');
    $groups=$pdo->prepare('SELECT * FROM community_groups WHERE id=?');
    foreach($st->fetchAll() as $ref){$id=(int)$ref['id'];$src=$ref['src'];$q=$src==='marketplace'?$market:($src==='places'?$places:$groups);$q->execute([$id]);$r=$q->fetch();if(!$r)continue;
        if($src==='marketplace'){$x=listing_row($r);$x['type']=$x['type']?:'listing';}
        elseif($src==='places'){$x=place_row($r);$x['type']='places';$x['user_id']=$uid;}
        else{$x=$r;$x['type']='groups';$x['user_id']=$uid;}
        $x['pending_review']=!in_array(strtolower((string)($r['status']??'approved')),['approved','active','published'],true);
        $x=add_latest_change_state($x,$src,$id,$uid,$canSeePrivate);$out[]=$x;
    }
    response_json(['items'=>$out,'listings'=>$out,'data'=>$out,'pagination'=>afu_pagination($page,$limit,$total)]);
}
if (preg_match('#^/users/([^/]+)/marketplace-listings$#',$path,$mm) && $meth==='GET') {
    $u=user_lookup(rawurldecode($mm[1]));if(!$u)fail('User not found',404);
    $canSeePrivate=$viewer && ((int)$viewer===(int)$u['id'] || truthy(user_profile_row((int)$viewer)['is_admin']??0));
    [$page,$limit,$offset]=afu_page();
    $where=' WHERE (user_id=? OR created_by=?)';
    if(!$canSeePrivate)$where.=" AND (is_active=1 OR is_active IS NULL) AND COALESCE(status,'approved')='approved'";
    $st=$pdo->prepare('SELECT COUNT(*) FROM marketplace_listings'.$where);$st->execute([$u['id'],$u['id']]);$total=(int)$st->fetchColumn();
    $st=$pdo->prepare("SELECT * FROM marketplace_listings$where ORDER BY id DESC LIMIT $limit OFFSET $offset");$st->execute([$u['id'],$u['id']]);
    $rows=[];foreach($st->fetchAll() as $rr){$x=listing_row($rr);$x=add_latest_change_state($x,'marketplace',(int)$rr['id'],(int)$u['id'],$canSeePrivate);$rows[]=$x;}
    response_json(['listings'=>$rows,'items'=>$rows,'data'=>$rows,'pagination'=>afu_pagination($page,$limit,$total)]);
}

// Public contact: validated, rate-limited and stored in the active database.
if ($path==='/contact' && $meth==='POST') {
    $d=input_all();
    $name=trim((string)($d['name']??''));$email=trim((string)($d['email']??''));
    $subject=trim((string)($d['subject']??''));$message=trim((string)($d['message']??''));
    if (!empty($d['website'])) fail('Invalid request',400);
    if (mb_strlen($name)<2 || mb_strlen($name)>100 || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>190 || mb_strlen($subject)<3 || mb_strlen($subject)>160 || mb_strlen($message)<10 || mb_strlen($message)>5000) fail('Check name, email, subject and message',422);
    $root=is_production_runtime() ? afu_private_runtime_storage_root() : sys_get_temp_dir().DIRECTORY_SEPARATOR.'answerforu-local-contact';
    if ($root===null) fail('Contact protection unavailable',503);
    $dir=$root.DIRECTORY_SEPARATOR.'security'.DIRECTORY_SEPARATOR.'contact-throttle';
    if (!is_dir($dir) && !@mkdir($dir,0700,true) && !is_dir($dir)) fail('Contact protection unavailable',503);
    $ip=(string)($_SERVER['REMOTE_ADDR']??'unknown');
    $file=$dir.DIRECTORY_SEPARATOR.hash('sha256','contact:'.$ip).'.json';
    $handle=@fopen($file,'c+'); if (!$handle) fail('Contact protection unavailable',503);
    try {
        if (!flock($handle,LOCK_EX)) fail('Contact protection unavailable',503);
        $past=json_decode((string)stream_get_contents($handle),true);$now=time();
        $recent=array_values(array_filter(is_array($past)?$past:[],static fn($t)=>is_int($t)&&$t>$now-3600&&$t<=$now));
        if (count($recent)>=5) {header('Retry-After: 3600');fail('Too many messages. Try again later.',429);}
        // Table is created only when a valid message is submitted; does not alter existing user content.
        $pdo->exec("CREATE TABLE IF NOT EXISTS contact_messages (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(190) NOT NULL, subject VARCHAR(160) NOT NULL, message TEXT NOT NULL, status VARCHAR(24) NOT NULL DEFAULT 'new', created_at DATETIME NOT NULL, INDEX idx_contact_created (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $stmt=$pdo->prepare('INSERT INTO contact_messages (name,email,subject,message,status,created_at) VALUES (?,?,?,?,?,?)');
        $stmt->execute([$name,$email,$subject,$message,'new',now_sql()]);
        $id=(int)$pdo->lastInsertId();
        $recent[]=$now;rewind($handle);ftruncate($handle,0);
        if(fwrite($handle,json_encode($recent))===false || !fflush($handle)) fail('Contact protection unavailable',503);
        @chmod($file,0600);
    } finally {flock($handle,LOCK_UN);fclose($handle);}
    response_json(['ok'=>true,'id'=>$id],201);
}

// ---------- user learning activity (additive, never rewrites content) ----------
function afu_learning_tables(PDO $pdo): void {
    if (is_sqlite()) {
        $pdo->exec('CREATE TABLE IF NOT EXISTS afu_learning_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, module VARCHAR(40) NOT NULL, attempt_key VARCHAR(80) NOT NULL UNIQUE, score INTEGER NOT NULL, total INTEGER NOT NULL, completed_at TEXT NOT NULL)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_afu_learning_attempts_user ON afu_learning_attempts(user_id,id)');
        $pdo->exec('CREATE TABLE IF NOT EXISTS afu_learning_visits (user_id INTEGER NOT NULL, module VARCHAR(40) NOT NULL, visited_at TEXT NOT NULL, PRIMARY KEY(user_id,module))');
        $pdo->exec('CREATE TABLE IF NOT EXISTS afu_learning_completed (user_id INTEGER NOT NULL, module VARCHAR(40) NOT NULL, item_id VARCHAR(160) NOT NULL, completed_at TEXT NOT NULL, PRIMARY KEY(user_id,module,item_id))');
    } else {
        $pdo->exec('CREATE TABLE IF NOT EXISTS afu_learning_attempts (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, module VARCHAR(40) NOT NULL, attempt_key VARCHAR(80) NOT NULL UNIQUE, score SMALLINT UNSIGNED NOT NULL, total SMALLINT UNSIGNED NOT NULL, completed_at DATETIME NOT NULL, INDEX idx_afu_learning_attempts_user(user_id,id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $pdo->exec('CREATE TABLE IF NOT EXISTS afu_learning_visits (user_id BIGINT NOT NULL, module VARCHAR(40) NOT NULL, visited_at DATETIME NOT NULL, PRIMARY KEY(user_id,module)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $pdo->exec('CREATE TABLE IF NOT EXISTS afu_learning_completed (user_id BIGINT NOT NULL, module VARCHAR(40) NOT NULL, item_id VARCHAR(160) NOT NULL, completed_at DATETIME NOT NULL, PRIMARY KEY(user_id,module,item_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    }
}
if ($path==='/learn/progress' && $meth==='GET') {
    $me=current_user_id(true);afu_learning_tables($pdo);
    $st=$pdo->prepare('SELECT module,score,total,completed_at FROM afu_learning_attempts WHERE user_id=? ORDER BY id DESC LIMIT 60');$st->execute([$me]);$attempts=$st->fetchAll();
    $st=$pdo->prepare('SELECT module,visited_at FROM afu_learning_visits WHERE user_id=?');$st->execute([$me]);$visits=$st->fetchAll();
    $st=$pdo->prepare('SELECT module,item_id,completed_at FROM afu_learning_completed WHERE user_id=? ORDER BY module,item_id');$st->execute([$me]);$completions=$st->fetchAll();
    $byModule=[];foreach($attempts as $a){$module=(string)$a['module'];if(!isset($byModule[$module]))$byModule[$module]=['score'=>(int)$a['score'],'total'=>(int)$a['total'],'percent'=>(int)round(100*(int)$a['score']/max(1,(int)$a['total'])),'completed_at'=>$a['completed_at']];}
    response_json(['ok'=>true,'latest'=>$byModule,'attempts'=>$attempts,'visits'=>$visits,'completions'=>$completions]);
}
if ($path==='/learn/progress' && $meth==='POST') {
    $me=current_user_id(true);$d=input_all();$module=clean_string($d['module']??'');
    if(!in_array($module,['mixed','money','signs','measure','life','stores','services','education'],true))fail('Invalid learning path',422);
    afu_learning_tables($pdo);
    $visitOnly=truthy($d['visit_only']??false);
    if(is_sqlite()){$pdo->prepare('INSERT OR REPLACE INTO afu_learning_visits (user_id,module,visited_at) VALUES (?,?,?)')->execute([$me,$module,now_sql()]);}
    else{$pdo->prepare('INSERT INTO afu_learning_visits (user_id,module,visited_at) VALUES (?,?,?) ON DUPLICATE KEY UPDATE visited_at=VALUES(visited_at)')->execute([$me,$module,now_sql()]);}
    if($visitOnly) response_json(['ok'=>true,'visited'=>true]);
    if(array_key_exists('item_id',$d)) {
        $item=clean_string($d['item_id']);
        if(!preg_match('/^[a-zA-Z0-9_:.-]{1,160}$/',$item))fail('Invalid learning item',422);
        $completed=truthy($d['completed']??true);
        if($completed) {
            $sql=is_sqlite()?'INSERT OR IGNORE INTO afu_learning_completed (user_id,module,item_id,completed_at) VALUES (?,?,?,?)':'INSERT IGNORE INTO afu_learning_completed (user_id,module,item_id,completed_at) VALUES (?,?,?,?)';
            $pdo->prepare($sql)->execute([$me,$module,$item,now_sql()]);
        } else {
            $pdo->prepare('DELETE FROM afu_learning_completed WHERE user_id=? AND module=? AND item_id=?')->execute([$me,$module,$item]);
        }
        response_json(['ok'=>true,'completed'=>$completed,'module'=>$module,'item_id'=>$item]);
    }
    $score=filter_var($d['score']??null,FILTER_VALIDATE_INT);$total=filter_var($d['total']??null,FILTER_VALIDATE_INT);
    if($score===false||$total===false||$total<1||$total>100||$score<0||$score>$total)fail('Invalid quiz result',422);
    $key=clean_string($d['attempt_key']??'');if(!preg_match('/^[a-zA-Z0-9_-]{12,80}$/',$key))fail('Invalid attempt key',422);
    $sql=is_sqlite()?'INSERT OR IGNORE INTO afu_learning_attempts (user_id,module,attempt_key,score,total,completed_at) VALUES (?,?,?,?,?,?)':'INSERT IGNORE INTO afu_learning_attempts (user_id,module,attempt_key,score,total,completed_at) VALUES (?,?,?,?,?,?)';
    $pdo->prepare($sql)->execute([$me,$module,$key,$score,$total,now_sql()]);response_json(['ok'=>true,'saved'=>true]);
}

require_once __DIR__.'/search-synonyms.php';

// ---------- marketplace ----------
if (($path==='/listings'||$path==='/marketplace/listings') && $meth==='GET') {
    $type=clean_string($_GET['type']??'');$sql="SELECT * FROM marketplace_listings WHERE (is_active=1 OR is_active IS NULL) AND COALESCE(status,'approved')='approved'";$params=[];if($type!==''){$sql.=' AND type=?';$params[]=$type;}$sql.=' ORDER BY id DESC';$st=$pdo->prepare($sql);$st->execute($params);$rows=array_map('listing_row',$st->fetchAll());
    $marketSearch=trim((string)($_GET['q']??''));
    if($marketSearch!=='') $rows=array_values(array_filter($rows,static fn($row)=>afu_search_matches_listing($row,$marketSearch)));
    $marketCategory=trim((string)($_GET['category']??''));
    if($marketCategory!=='' && strtolower($marketCategory)!=='all') $rows=array_values(array_filter($rows,static fn($row)=>afu_search_matches_category($row,$marketCategory)));
    if(($_GET['compact']??'')==='1')response_json(['items'=>$rows]);
    response_json(['listings'=>$rows,'items'=>$rows,'data'=>$rows]);
}
if ($path==='/listings' && $meth==='POST') {
    $me=current_user_id(true);$d=input_all();if(array_key_exists('price_value',$d)&&trim((string)$d['price_value'])==='')$d['price_value']=null;if(array_key_exists('price_value',$d)&&$d['price_value']!==null&&!is_numeric($d['price_value']))fail('Invalid price_value',422,['field_errors'=>['price'=>'Enter a valid numeric price']]);$images=upload_many('images','marketplace');if(!$images)$images=json_array($d['images']??$d['images_json']??[]);$images=persist_media_images($images,'marketplace');$storedData=$d;$storedData['images']=$images;unset($storedData['images_json']);
    if(($d['type']??'')==='services'){
        afu_ensure_marketplace_service_fields($pdo);
        $missing=[];
        if(trim((string)($d['title']??''))==='')$missing['title']='Service title is required';
        if(trim((string)($d['phone']??$d['contact']??''))==='')$missing['phone']='A contact phone is required';
        if($missing)fail('Please correct the highlighted service fields',422,['field_errors'=>$missing]);
    }
    $fields=['type','title','city','state','link','contact','currency','price_type','price_value','platform','topic','notes','description','price','website','address','category','phone','whatsapp','email','car_year','car_mileage','bedrooms','bathrooms','job_type','status_label'];
    $cols=['user_id','created_by','created_at','updated_at','is_active','status','images_json','data_json'];$vals=[$me,$me,now_sql(),now_sql(),0,'pending',json_encode($images,JSON_UNESCAPED_SLASHES),json_encode($storedData,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)];
    foreach($fields as $f){if(array_key_exists($f,$d)){$cols[]=$f;$vals[]=$d[$f];}}
    $qs=implode(',',array_fill(0,count($cols),'?'));$pdo->prepare('INSERT INTO marketplace_listings (`'.implode('`,`',$cols).'`) VALUES ('.$qs.')')->execute($vals);$id=(int)$pdo->lastInsertId();$pdo->prepare('UPDATE marketplace_listings SET public_id=? WHERE id=?')->execute([$id,$id]);moderation_event('marketplace',$id,$me,'submitted',null,'pending','Submitted for admin review.',null,['title'=>(string)($d['title']??'')]);/* Self-action confirmation is shown inline; no self-notification. */$st=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=?');$st->execute([$id]);{ $out=listing_row($st->fetch()); $out['pending_review']=true; $out['moderation_message']='Submitted for admin review before publication.'; response_json($out,201);}
}
if ((preg_match('#^/(?:listings|marketplace/item)/(place|group)_(\d+)$#i',$path,$pm)) && $meth==='GET') {
    $pk=strtolower((string)$pm[1]);$id=(int)$pm[2];$table=$pk==='place'?'community_places':'community_groups';$kind=$pk==='place'?'places':'groups';$st=$pdo->prepare("SELECT * FROM $table WHERE id=? LIMIT 1");$st->execute([$id]);$r=$st->fetch();if(!$r)fail('Listing not found',404);$status=strtolower(trim((string)($r['status']??'approved')));$public=in_array($status,['approved','active','published'],true) && ($kind!=='places' || public_place_has_required_fields($r));$owner=(int)($r['created_by']??0);$admin=$viewer?truthy(user_profile_row((int)$viewer)['is_admin']??0):false;if(!$public && (int)$viewer!==$owner && !$admin)fail('Listing not found',404);$out=$kind==='places'?place_row($r):$r;$out['type']=$kind;$out['pending_review']=!$public;response_json($out);
}

if ((preg_match('#^/listings/([^/]+)$#',$path,$mm)||preg_match('#^/marketplace/item/([^/]+)$#',$path,$mm)) && !in_array(strtolower((string)$mm[1]),['services','jobs','housing','products','places','groups'],true) && $meth==='GET') {
    $raw=$mm[1];$id=(int)preg_replace('/\D+/','',$raw);if(!$id)$id=(int)$raw;$st=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=? OR public_id=? LIMIT 1');$st->execute([$id,$id]);$r=$st->fetch();if(!$r)fail('Listing not found',404);$owner=(int)($r['user_id']??($r['created_by']??0));$isAdmin=$viewer?truthy(user_profile_row((int)$viewer)['is_admin']??0):false;$status=strtolower((string)($r['status']??'approved'));$active=!array_key_exists('is_active',$r)||$r['is_active']===null||truthy($r['is_active']);$public=$status==='approved'&&$active;if(!$public && (int)$viewer!==$owner && !$isAdmin)fail('Listing not found',404);response_json(listing_row($r));
}
if (preg_match('#^/listings/([^/]+)$#',$path,$mm) && in_array($meth,['PUT','PATCH'],true)) {
    $me=current_user_id(true);$id=(int)preg_replace('/\D+/','',$mm[1]);$st=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=? OR public_id=?');$st->execute([$id,$id]);$r=$st->fetch();if(!$r)fail('Listing not found',404);$isAdmin=truthy(user_profile_row($me)['is_admin']??0);if((int)$r['user_id']!==$me&&!$isAdmin)fail('Forbidden',403);$d=input_all();if(array_key_exists('price_value',$d)&&trim((string)$d['price_value'])==='')$d['price_value']=null;if(array_key_exists('price_value',$d)&&$d['price_value']!==null&&!is_numeric($d['price_value']))fail('Invalid price_value',422,['field_errors'=>['price'=>'Enter a valid numeric price']]);
    $allowed=['type','title','city','state','link','contact','currency','price_type','price_value','platform','topic','notes','description','price','website','address','category','phone','whatsapp','email','car_year','car_mileage','bedrooms','bathrooms','job_type','status_label'];
    $payload=[];foreach($allowed as $f){if(array_key_exists($f,$d))$payload[$f]=$d[$f];}
    $images=upload_many('images','marketplace');if(!$images && isset($d['images']) && is_array($d['images']))$images=$d['images'];$images=persist_media_images($images,'marketplace');if($images)$payload['images_json']=json_encode($images,JSON_UNESCAPED_SLASHES);
    if($isAdmin){
        $sets=[];$vals=[];foreach($payload as $f=>$v){$sets[]="`$f`=?";$vals[]=$v;}if($sets){$sets[]='updated_at=?';$vals[]=now_sql();$vals[]=$r['id'];$pdo->prepare('UPDATE marketplace_listings SET '.implode(',',$sets).' WHERE id=?')->execute($vals);}response_json(['ok'=>true,'message'=>'Admin edit applied']);
    }
    if(strtolower((string)($r['status']??'approved'))!=='approved'){
        $sets=[];$vals=[];foreach($payload as $f=>$v){$sets[]="`$f`=?";$vals[]=$v;}$sets[]="status='pending'";$sets[]='is_active=0';$sets[]='admin_reason=NULL';$sets[]='reviewed_by=NULL';$sets[]='reviewed_at=NULL';$sets[]='updated_at=?';$vals[]=now_sql();$vals[]=$r['id'];$pdo->prepare('UPDATE marketplace_listings SET '.implode(',',$sets).' WHERE id=?')->execute($vals);supersede_other_listing_changes('marketplace',(int)$r['id'],$me);$rq=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=?');$rq->execute([(int)$r['id']]);$freshRaw=$rq->fetch();if(!$freshRaw||strtolower((string)($freshRaw['status']??''))!=='pending'||truthy($freshRaw['is_active']??0))fail('Listing resubmit did not reach pending state',500);moderation_event('marketplace',(int)$r['id'],$me,'resubmitted',strtolower((string)($r['status']??'')),'pending','User updated the rejected/pending submission and sent it again.',null,['previous_admin_reason'=>$r['admin_reason']??null]);/* Inline confirmation; no self-notification. */$fresh=listing_row($freshRaw);$fresh['pending_review']=true;$fresh['queue_at']=$fresh['updated_at']??now_sql();response_json(['ok'=>true,'item'=>$fresh,'listing'=>$fresh,'status'=>'pending','pending_review'=>true,'queue_at'=>$fresh['queue_at'],'message'=>'Your draft was updated and returned to the admin review queue.']);
    }
    $queued=queue_listing_change('marketplace',(int)$r['id'],$me,$payload);
    response_json(['ok'=>true,'status'=>'pending','pending_review'=>true,'change_request_id'=>(int)$queued['id'],'reused_rejected_request'=>!empty($queued['reused']),'queue_at'=>$queued['queue_at']??now_sql(),'message'=>!empty($queued['reused'])?'Your rejected edit was corrected and returned to the admin review queue.':'Your changes were sent to the admin for review. The current approved version stays live until approval.']);
}
if (preg_match('#^/listings/([^/]+)$#',$path,$mm) && $meth==='DELETE') {
    $me=current_user_id(true);$id=(int)preg_replace('/\D+/','',$mm[1]);$st=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=? OR public_id=?');$st->execute([$id,$id]);$r=$st->fetch();if(!$r)fail('Listing not found',404);if((int)$r['user_id']!==$me&&!truthy(user_profile_row($me)['is_admin']??0))fail('Forbidden',403);
    // Item reviews must not survive a deleted listing (including profile review activity).
    afu_atomic_write($pdo, function() use ($pdo, $r) {
        $pdo->prepare('DELETE FROM marketplace_listing_changes WHERE source_type=? AND listing_id=?')->execute(['marketplace',(int)$r['id']]);
        $pdo->prepare('DELETE FROM marketplace_reviews WHERE listing_id=?')->execute([(int)$r['id']]);
        $pdo->prepare('DELETE FROM marketplace_listings WHERE id=?')->execute([(int)$r['id']]);
    });
    response_json(['ok'=>true]);
}

// Listing reviews, with aliases.
if ((preg_match('#^/(?:listings|marketplace/item)/([^/]+)/reviews$#',$path,$mm)) && $meth==='GET') {
    $id=(int)preg_replace('/\D+/','',$mm[1]);$vs=$pdo->prepare('SELECT user_id,created_by,status,is_active FROM marketplace_listings WHERE id=? OR public_id=? LIMIT 1');$vs->execute([$id,$id]);$vr=$vs->fetch();if(!$vr)fail('Listing not found',404);$vowner=(int)($vr['user_id']??$vr['created_by']??0);$vadmin=$viewer?truthy(user_profile_row((int)$viewer)['is_admin']??0):false;$vpublic=strtolower((string)($vr['status']??'approved'))==='approved' && (!array_key_exists('is_active',$vr) || $vr['is_active']===null || truthy($vr['is_active']));if(!$vpublic && (int)$viewer!==$vowner && !$vadmin)fail('Listing not found',404);
    $vis=$pdo->prepare('SELECT id,user_id,created_by,status,is_active FROM marketplace_listings WHERE id=? OR public_id=? LIMIT 1');$vis->execute([$id,$id]);$listing=$vis->fetch();
    if(!$listing)fail('Listing not found',404);
    $ownerId=(int)($listing['user_id']??$listing['created_by']??0);
    $viewerUser=$viewer?user_profile_row((int)$viewer):[];
    $isAdminViewer=$viewer && (truthy($viewerUser['is_admin']??0) || strtolower((string)($viewerUser['role']??''))==='admin');
    $isPublic=strtolower(trim((string)($listing['status']??'approved')))==='approved' && (!array_key_exists('is_active',$listing) || $listing['is_active']===null || truthy($listing['is_active']));
    if(!$isPublic && (!$viewer || ((int)$viewer!==$ownerId && !$isAdminViewer)))fail('Listing not found',404);
    $listingId=(int)$listing['id'];
    $st=$pdo->prepare('SELECT * FROM marketplace_reviews WHERE listing_id=? ORDER BY id DESC');$st->execute([$listingId]);$rows=[];foreach($st->fetchAll() as $r){$u=user_profile_row((int)$r['user_id'])?:legacy_deleted_user_profile((int)$r['user_id'])?:[];$r['id']=(int)$r['id'];$r['rating']=(int)$r['stars'];$r['text']=$r['comment'];$r['user']=public_user_profile($u);$r['reviewer_id']=(int)$r['user_id'];$r['reviewer_name']=$u['display_name']??($u['username']??'User');$r['user_name']=$r['reviewer_name'];$r['reviewer_public_id']=$u['public_id']??null;$r['author']=$r['reviewer_name'];$rows[]=$r;}response_json(['reviews'=>$rows,'items'=>$rows,'data'=>$rows]);
}
if ((preg_match('#^/(?:listings|marketplace/item)/([^/]+)/reviews$#',$path,$mm)) && $meth==='POST') {
    $me=current_user_id(true);$id=(int)preg_replace('/\D+/','',$mm[1]);if(!$id)fail('Listing not found',404);
    $exists=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=? OR public_id=? LIMIT 1');$exists->execute([$id,$id]);$listing=$exists->fetch();if(!$listing || strtolower((string)($listing['status']??'approved'))!=='approved' || (array_key_exists('is_active',$listing) && $listing['is_active']!==null && !truthy($listing['is_active'])))fail('Listing not found',404);$listingId=(int)$listing['id'];
    $ownerId=(int)($listing['user_id']?:($listing['created_by']??0));
    if ($ownerId===$me) fail('You cannot review your own listing',403);
    $listingTitle=(string)($listing['title']??'Listing');$listingPublic=(string)($listing['public_id']??$listingId);$listingType=(string)($listing['type']??'listing');
    $stars=max(1,min(5,(int)input('stars',input('rating',5))));$comment=clean_string(input('comment',input('text','')));$st=$pdo->prepare('SELECT id FROM marketplace_reviews WHERE listing_id=? AND user_id=?');$st->execute([$listingId,$me]);$rid=$st->fetchColumn();
    if($rid){
        $pdo->prepare('UPDATE marketplace_reviews SET listing_type=?,stars=?,comment=?,created_at=?,owner_user_id=?,listing_title_snapshot=?,listing_public_id_snapshot=?,item_deleted=0 WHERE id=?')->execute([$listingType,$stars,$comment,now_sql(),$ownerId,$listingTitle,$listingPublic,$rid]);
    }else{
        $pdo->prepare('INSERT INTO marketplace_reviews (listing_type,listing_id,user_id,stars,comment,created_at,owner_user_id,listing_title_snapshot,listing_public_id_snapshot,item_deleted) VALUES (?,?,?,?,?,?,?,?,?,0)')->execute([$listingType,$listingId,$me,$stars,$comment,now_sql(),$ownerId,$listingTitle,$listingPublic]);$rid=$pdo->lastInsertId();
    }
    response_json(['ok'=>true,'id'=>(int)$rid,'listing_id'=>$listingId,'stars'=>$stars,'rating'=>$stars,'comment'=>$comment]);
}
if (preg_match('#^/(?:listings|marketplace/item)/([^/]+)/reviews/me$#',$path,$mm) && $meth==='GET') {
    $me=current_user_id(true);$id=(int)preg_replace('/\D+/','',$mm[1]);$st=$pdo->prepare('SELECT * FROM marketplace_reviews WHERE listing_id=? AND user_id=? LIMIT 1');$st->execute([$id,$me]);$r=$st->fetch();response_json($r?:null);
}
if (preg_match('#^/(?:listings|marketplace/item)/([^/]+)/reviews/me$#',$path,$mm) && $meth==='DELETE') {
    $me=current_user_id(true);$id=(int)preg_replace('/\D+/','',$mm[1]);$pdo->prepare('DELETE FROM marketplace_reviews WHERE listing_id=? AND user_id=?')->execute([$id,$me]);response_json(['ok'=>true]);
}
if (preg_match('#^/(?:listings|marketplace/item)/([^/]+)/reviews/([^/]+)$#',$path,$mm) && strtolower((string)$mm[2])!=='me' && $meth==='DELETE') {
    $me=current_user_id(true);$rid=(int)$mm[2];$pdo->prepare('DELETE FROM marketplace_reviews WHERE id=? AND user_id=?')->execute([$rid,$me]);response_json(['ok'=>true]);
}

// ---------- community places/groups ----------
foreach ([['places','community_places','place_reviews','place_id'],['groups','community_groups','group_reviews','group_id']] as $meta) {
    [$kind,$table,$reviewTable,$fk]=$meta;
    $isPlace = $kind === 'places';

    if (($path==="/community/$kind"||$path==="/$kind"||$path==="/community_$kind") && $meth==='GET') {
        // Public/community feeds never include pending or rejected submissions, even for the owner.
        $where=["(status IS NULL OR status IN ('approved','active','published'))"];$args=[];
        $q=trim((string)($_GET['q']??''));$state=trim((string)($_GET['state']??''));$city=trim((string)($_GET['city']??''));
        $category=trim((string)($_GET['category']??''));$platform=trim((string)($_GET['platform']??''));$topic=trim((string)($_GET['topic']??''));
        if($q!=='' && !afu_search_category_aliases($q,$kind)){
            $aliases=afu_search_expand($q);
            $columns=$isPlace?['name','notes','address','denomination','category','language_tags','culture_tags']:['name','notes','topic','platform'];
            $alternatives=[];
            foreach($aliases as $term){
                $alternatives[]='('.implode(' OR ',array_map(static fn($column)=>$column.' LIKE ?', $columns)).')';
                foreach($columns as $_) $args[]='%'.$term.'%';
            }
            if($alternatives) $where[]='('.implode(' OR ',$alternatives).')';
        }
        if($state!==''&&strtolower($state)!=='any'){$where[]='state=?';$args[]=$state;}
        if($city!==''){$where[]='LOWER(city)=LOWER(?)';$args[]=$city;}
        if(!$isPlace&&$platform!==''&&strtolower($platform)!=='all'){$where[]='platform=?';$args[]=$platform;}
        $orderBy=$isPlace?"COALESCE(is_seeded,0) DESC, id DESC":"id DESC";
        $sql="SELECT * FROM $table WHERE ".implode(' AND ',$where)." ORDER BY {$orderBy}";
        $st=$pdo->prepare($sql);$st->execute($args);$rows=$st->fetchAll();
        // Use identical classification semantics for a dropdown choice and a
        // recognized AR/EN/ES search term, before pagination/rating aggregation.
        if($q!=='' && afu_search_category_aliases($q,$kind)) $rows=array_values(array_filter($rows,static fn($r)=>afu_search_matches_listing($r,$q,$kind)));
        if($category!==''&&strtolower($category)!=='all') $rows=array_values(array_filter($rows,static fn($r)=>afu_search_matches_category($r,$category,$kind)));
        if($topic!==''&&strtolower($topic)!=='all') $rows=array_values(array_filter($rows,static fn($r)=>afu_search_matches_category($r,$topic,$kind)));
        // Incomplete locations stay in DB for admin review but cannot appear in
        // public community feeds or the mobile app as verified destinations.
        if($isPlace){
            $rows=array_values(array_filter($rows,'public_place_has_required_fields'));
        }
        // Opt-in response paging: keep the unpaged payload exactly as before
        // for existing website and native clients. Count only approved, valid
        // public locations before slicing. Never materialize owner profiles or
        // ratings for pages the caller did not request.
        $pageMeta=null;
        if(($_GET['paged']??'')==='1'){
            [$page,$limit,$offset]=afu_page();
            $total=count($rows);
            $rows=array_slice($rows,$offset,$limit);
            $pageMeta=afu_pagination($page,$limit,$total);
        }
        if($isPlace){
            // One aggregate query per 300 places, not a separate ratings query
            // for each of the 392+ curated places. Keep the exact old JSON shape
            // (all visible items; client-side pagination still works unchanged).
            $ratings=[];
            $ids=array_values(array_unique(array_map(static fn(array $row): int => (int)$row['id'],$rows)));
            try {
                foreach(array_chunk($ids,300) as $chunk){
                    $marks=implode(',',array_fill(0,count($chunk),'?'));
                    $rq=$pdo->prepare("SELECT place_id, COUNT(*) AS c, COALESCE(AVG(stars),0) AS a FROM place_reviews WHERE place_id IN ($marks) GROUP BY place_id");
                    $rq->execute($chunk);
                    foreach($rq->fetchAll() as $rating){$ratings[(int)$rating['place_id']]=$rating;}
                }
            } catch(Throwable $e){
                // Review history is optional for public browsing; an unavailable
                // reviews table must never take down the entire community feed.
                error_log('AnswerForU community places ratings unavailable: '.$e->getMessage());
            }
            $visible=[];
            foreach($rows as $place){
                try {
                    $visible[]=place_row($place,$ratings[(int)$place['id']]??['c'=>0,'a'=>0]);
                } catch(Throwable $e){
                    // Log the bad row and let all other approved locations display.
                    error_log('AnswerForU public place '.(int)($place['id']??0).' failed to render: '.$e->getMessage());
                }
            }
            $rows=$visible;
        }
        if(($_GET['compact']??'')==='1') {
            $compact=['items'=>$rows];
            if($pageMeta!==null)$compact['pagination']=$pageMeta;
            response_json($compact);
        }
        if($pageMeta!==null)response_json([$kind=>$rows,'items'=>$rows,'data'=>$rows,'pagination'=>$pageMeta]);
        response_json([$kind=>$rows,'items'=>$rows,'data'=>$rows]);
    }

    if (($path==="/community/$kind"||$path==="/$kind"||$path==="/community_$kind") && $meth==='POST') {
        $me=current_user_id(true);
        $d=input_all();

        if ($isPlace) {
            $name=clean_string($d['name']??$d['title']??'');
            if($name==='')fail('Name is required');
            $allowed=['category','city','state','address','phone','website','notes','denomination','google_maps_url'];
            $cols=['name','created_by','created_at','updated_at','status','reviewed_by','reviewed_at','admin_reason'];
            $vals=[$name,$me,now_sql(),now_sql(),'pending',null,null,null];
            foreach($allowed as $f){if(array_key_exists($f,$d)){$cols[]=$f;$vals[]=$d[$f];}}
            if(array_key_exists('language_tags',$d)||array_key_exists('languageTags',$d)){$cols[]='language_tags';$vals[]=json_encode(json_array($d['language_tags']??$d['languageTags']),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);}
            if(array_key_exists('culture_tags',$d)||array_key_exists('cultureTags',$d)){$cols[]='culture_tags';$vals[]=json_encode(json_array($d['culture_tags']??$d['cultureTags']),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);}

            $imgs=upload_many('images','marketplace');
            if(!$imgs && array_key_exists('images',$d))$imgs=json_array($d['images']);
            if(!$imgs && array_key_exists('images_json',$d))$imgs=json_array($d['images_json']);
            $imgs=persist_media_images($imgs,'marketplace');
            if($imgs || array_key_exists('images',$d) || array_key_exists('images_json',$d)){
                $cols[]='images';$vals[]=json_encode($imgs,JSON_UNESCAPED_SLASHES);
            }

            $pdo->prepare("INSERT INTO $table (`".implode('`,`',$cols)."`) VALUES (".implode(',',array_fill(0,count($cols),'?')).')')->execute($vals);
            $id=(int)$pdo->lastInsertId();
            $st=$pdo->prepare("SELECT * FROM $table WHERE id=?");$st->execute([$id]);$item=place_row($st->fetch());
        } else {
            $name=clean_string($d['name']??$d['title']??'');
            $link=clean_string($d['link']??$d['website']??'');
            if($name==='')fail('Name is required');
            if($link==='')fail('Link is required');
            $allowed=['platform','city','state','topic','notes'];
            $cols=['name','link','created_by','created_at','updated_at','status','reviewed_by','reviewed_at','admin_reason'];
            $vals=[$name,$link,$me,now_sql(),now_sql(),'pending',null,null,null];
            foreach($allowed as $f){if(array_key_exists($f,$d)){$cols[]=$f;$vals[]=$d[$f];}}
            $pdo->prepare("INSERT INTO $table (`".implode('`,`',$cols)."`) VALUES (".implode(',',array_fill(0,count($cols),'?')).')')->execute($vals);
            $id=(int)$pdo->lastInsertId();
            $st=$pdo->prepare("SELECT * FROM $table WHERE id=?");$st->execute([$id]);$item=$st->fetch();
        }

        $item['type']=$kind;
        $item['status']='pending';
        $item['pending_review']=true;
        $item['moderation_message']='Submitted for admin review before publication.';
        moderation_event($kind,$id,$me,'submitted',null,'pending','Submitted for admin review.',null,['title'=>(string)($item['name']??'')]);/* No self-notification for own submission. */
        response_json(['ok'=>true,'id'=>$id,'item'=>$item,'status'=>'pending','pending_review'=>true,'moderation_message'=>$item['moderation_message']],201);
    }

    if ((preg_match("#^/community/$kind/([^/]+)$#",$path,$mm)) && $meth==='GET') {
        $id=(int)$mm[1];
        $st=$pdo->prepare("SELECT * FROM $table WHERE id=?");$st->execute([$id]);$r=$st->fetch();
        if(!$r)fail(ucfirst($kind).' not found',404);

        $status=strtolower(trim((string)($r['status']??'approved')));
        $isPublic=($status==='' || in_array($status,['approved','active','published'],true)) && (!$isPlace || public_place_has_required_fields($r));
        $ownerId=(int)($r['created_by']??0);
        $viewerUser=$viewer?user_profile_row((int)$viewer):null;
        $canSeePrivate=$viewer && ((int)$viewer===$ownerId || truthy($viewerUser['is_admin']??0) || strtolower((string)($viewerUser['role']??''))==='admin');
        if(!$isPublic && !$canSeePrivate)fail(ucfirst($kind).' not found',404);

        if($isPlace)$r=place_row($r);
        $r['type']=$kind;
        $r['pending_review']=!$isPublic;
        response_json($r);
    }

    if ((preg_match("#^/community/$kind/([^/]+)$#",$path,$mm)) && in_array($meth,['PUT','PATCH'],true)) {
        $me=current_user_id(true);
        $id=(int)$mm[1];
        $st=$pdo->prepare("SELECT * FROM $table WHERE id=?");$st->execute([$id]);$existing=$st->fetch();
        if(!$existing)fail('Not found',404);

        $actor=user_profile_row($me)?:[];
        $isAdminActor=truthy($actor['is_admin']??0) || strtolower((string)($actor['role']??''))==='admin';
        if((int)($existing['created_by']??0)!==$me && !$isAdminActor)fail('Forbidden',403);

        $d=input_all();
        $payload=[];
        if($isPlace){
            $fieldMap=['name','category','city','state','address','phone','website','notes','denomination','google_maps_url'];
            if(array_key_exists('title',$d) && !array_key_exists('name',$d))$d['name']=$d['title'];
        } else {
            $fieldMap=['name','platform','link','city','state','topic','notes'];
            if(array_key_exists('title',$d) && !array_key_exists('name',$d))$d['name']=$d['title'];
            if(array_key_exists('website',$d) && !array_key_exists('link',$d))$d['link']=$d['website'];
        }
        foreach($fieldMap as $f){if(array_key_exists($f,$d))$payload[$f]=$d[$f];}
        if($isPlace&&(array_key_exists('language_tags',$d)||array_key_exists('languageTags',$d)))$payload['language_tags']=json_array($d['language_tags']??$d['languageTags']);
        if($isPlace&&(array_key_exists('culture_tags',$d)||array_key_exists('cultureTags',$d)))$payload['culture_tags']=json_array($d['culture_tags']??$d['cultureTags']);

        if($isPlace && (array_key_exists('images',$d)||array_key_exists('images_json',$d)||isset($_FILES['images']))){
            $imgs=upload_many('images','marketplace');
            if(!$imgs && array_key_exists('images',$d))$imgs=json_array($d['images']);
            if(!$imgs && array_key_exists('images_json',$d))$imgs=json_array($d['images_json']);
            $payload['images']=persist_media_images($imgs,'marketplace');
        }

        $name=trim((string)($payload['name']??$existing['name']??''));
        if($name==='')fail('Name is required');
        if(!$isPlace){
            $link=trim((string)($payload['link']??$existing['link']??''));
            if($link==='')fail('Link is required');
        }

        $existingStatus=strtolower(trim((string)($existing['status']??'approved')));
        $isApproved=$existingStatus==='' || in_array($existingStatus,['approved','active','published'],true);

        // Admin edits are direct. Owners editing a pending/rejected draft update the private draft.
        if($isAdminActor || !$isApproved){
            $sets=[];$vals=[];
            foreach($payload as $f=>$v){
                if($f==='images'){$sets[]='images=?';$vals[]=json_encode(is_array($v)?$v:json_array($v),JSON_UNESCAPED_SLASHES);}
                elseif(in_array($f,['language_tags','culture_tags'],true)){$sets[]="`$f`=?";$vals[]=json_encode(is_array($v)?$v:json_array($v),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);}
                else{$sets[]="`$f`=?";$vals[]=$v;}
            }
            if(!$isAdminActor){
                $sets[]="status='pending'";$sets[]='admin_reason=NULL';$sets[]='reviewed_by=NULL';$sets[]='reviewed_at=NULL';
            }
            $sets[]='updated_at=?';$vals[]=now_sql();$vals[]=$id;
            if($sets)$pdo->prepare("UPDATE $table SET ".implode(',',$sets).' WHERE id=?')->execute($vals);
            if(!$isAdminActor) supersede_other_listing_changes($kind,$id,$me);
            $st=$pdo->prepare("SELECT * FROM $table WHERE id=?");$st->execute([$id]);$itemRaw=$st->fetch();
            if(!$itemRaw)fail('Not found after update',500);
            if(!$isAdminActor && strtolower(trim((string)($itemRaw['status']??'')))!=='pending')fail('Submission resubmit did not reach pending state',500);
            $item=$isPlace?place_row($itemRaw):$itemRaw;
            $item['type']=$kind;
            if(!$isAdminActor){moderation_event($kind,$id,$me,'resubmitted',$existingStatus,'pending','User updated the rejected/pending submission and sent it again.',null,['previous_admin_reason'=>$existing['admin_reason']??null]);/* Inline confirmation; no self-notification. */$item['status']='pending';$item['pending_review']=true;$item['queue_at']=$item['updated_at']??now_sql();$item['moderation_message']='Changes saved to your private draft and sent for review.';}
            response_json(['ok'=>true,'item'=>$item,'status'=>$item['status']??$existingStatus,'pending_review'=>!$isAdminActor]);
        }

        // Approved public content remains unchanged while an owner edit waits for admin review.
        // Reuse the latest rejected request when one exists so it MOVES from Rejected -> Pending.
        $queued=queue_listing_change($kind,$id,$me,$payload);
        $changeId=(int)$queued['id'];
        $item=$existing;
        if($isPlace)$item=place_row($item);
        $item['type']=$kind;
        $item['pending_review']=true;
        $item['moderation_message']=!empty($queued['reused'])?'Your rejected edit was corrected and returned to the admin review queue.':'Your changes were sent to the admin for review. The approved version stays live until approval.';
        response_json(['ok'=>true,'item'=>$item,'status'=>'pending','pending_review'=>true,'change_request_id'=>$changeId,'reused_rejected_request'=>!empty($queued['reused']),'queue_at'=>$queued['queue_at']??now_sql(),'moderation_message'=>$item['moderation_message']]);
    }

    if ((preg_match("#^/community/$kind/([^/]+)$#",$path,$mm)) && $meth==='DELETE') {
        $me=current_user_id(true);$id=(int)$mm[1];
        $st=$pdo->prepare("SELECT created_by FROM $table WHERE id=?");$st->execute([$id]);$owner=$st->fetchColumn();
        if($owner===false)fail('Not found',404);
        if((int)$owner!==$me&&!truthy(user_profile_row($me)['is_admin']??0))fail('Forbidden',403);
        afu_atomic_write($pdo, function() use ($pdo, $reviewTable, $fk, $id, $kind, $table) {
            $pdo->prepare("DELETE FROM $reviewTable WHERE $fk=?")->execute([$id]);
            $pdo->prepare("DELETE FROM marketplace_listing_changes WHERE source_type=? AND listing_id=?")->execute([$kind,$id]);
            $pdo->prepare("DELETE FROM $table WHERE id=?")->execute([$id]);
        });
        response_json(['ok'=>true]);
    }

    if ((preg_match("#^/community/$kind/([^/]+)/reviews$#",$path,$mm)||preg_match("#^/$kind/([^/]+)/reviews$#",$path,$mm)) && $meth==='GET') {
        $id=(int)$mm[1];
        $vis=$pdo->prepare("SELECT id,created_by,status FROM $table WHERE id=? LIMIT 1");$vis->execute([$id]);$target=$vis->fetch();
        if(!$target)fail('Not found',404);
        $status=strtolower(trim((string)($target['status']??'approved')));
        $isPublic=$status==='' || in_array($status,['approved','active','published'],true);
        $viewerUser=$viewer?user_profile_row((int)$viewer):[];
        $canSeePrivate=$viewer && ((int)$viewer===(int)($target['created_by']??0) || truthy($viewerUser['is_admin']??0) || strtolower((string)($viewerUser['role']??''))==='admin');
        if(!$isPublic && !$canSeePrivate)fail('Not found',404);
        $st=$pdo->prepare("SELECT * FROM $reviewTable WHERE $fk=? ORDER BY id DESC");$st->execute([$id]);$rows=[];
        foreach($st->fetchAll() as $r){
            $r['user']=public_user_profile(user_profile_row((int)$r['user_id'])?:legacy_deleted_user_profile((int)$r['user_id']))?:[];
            $r['reviewer_id']=(int)$r['user_id'];
            $r['reviewer_name']=$r['user']['display_name']??($r['user']['username']??'User');
            $r['user_name']=$r['reviewer_name'];
            $r['reviewer_public_id']=$r['user']['public_id']??null;
            $r['author']=$r['reviewer_name'];
            $r['rating']=(int)$r['stars'];
            $r['comment']=$r['text']??'';
            $rows[]=$r;
        }
        response_json(['reviews'=>$rows,'items'=>$rows,'data'=>$rows]);
    }

    if ((preg_match("#^/community/$kind/([^/]+)/reviews$#",$path,$mm)||preg_match("#^/$kind/([^/]+)/reviews$#",$path,$mm)) && $meth==='POST') {
        $me=current_user_id(true);$id=(int)$mm[1];

        // Reviews are allowed only for currently public/approved community content.
        $st=$pdo->prepare("SELECT status,created_by FROM $table WHERE id=?");$st->execute([$id]);$targetRow=$st->fetch();if(!$targetRow)fail("Not found",404);$targetStatus=(string)($targetRow["status"]??"");
        if ((int)($targetRow["created_by"]??0)===$me) fail("You cannot review your own listing",403);
        if($targetStatus===false)fail('Not found',404);
        $targetStatus=strtolower(trim((string)$targetStatus));
        if($targetStatus!=='' && !in_array($targetStatus,['approved','active','published'],true))fail('Item is not public',409);

        $stars=max(1,min(5,(int)input('stars',input('rating',5))));
        $text=clean_string(input('text',input('comment','')));
        $name=user_profile_row($me)['display_name']??'';
        $st=$pdo->prepare("SELECT id FROM $reviewTable WHERE $fk=? AND user_id=?");$st->execute([$id,$me]);$rid=$st->fetchColumn();
        if($rid){$pdo->prepare("UPDATE $reviewTable SET stars=?,text=?,name=?,created_at=? WHERE id=?")->execute([$stars,$text,$name,now_sql(),$rid]);}
        else{$pdo->prepare("INSERT INTO $reviewTable ($fk,user_id,name,stars,text,created_at) VALUES (?,?,?,?,?,?)")->execute([$id,$me,$name,$stars,$text,now_sql()]);$rid=$pdo->lastInsertId();}
        response_json(['ok'=>true,'id'=>(int)$rid]);
    }

    if (preg_match("#^/community/$kind/([^/]+)/reviews/me$#",$path,$mm) && $meth==='GET') {
        $me=current_user_id(true);$id=(int)$mm[1];$st=$pdo->prepare("SELECT * FROM $reviewTable WHERE $fk=? AND user_id=? LIMIT 1");$st->execute([$id,$me]);response_json($st->fetch()?:null);
    }
    if (preg_match("#^/community/$kind/([^/]+)/reviews/me$#",$path,$mm) && $meth==='DELETE') {
        $me=current_user_id(true);$id=(int)$mm[1];$pdo->prepare("DELETE FROM $reviewTable WHERE $fk=? AND user_id=?")->execute([$id,$me]);response_json(['ok'=>true]);
    }
    if (preg_match("#^/community/$kind/([^/]+)/reviews/([^/]+)$#",$path,$mm) && strtolower((string)$mm[2])!=='me' && $meth==='DELETE') {
        $me=current_user_id(true);$rid=(int)$mm[2];$pdo->prepare("DELETE FROM $reviewTable WHERE id=? AND user_id=?")->execute([$rid,$me]);response_json(['ok'=>true]);
    }
}

// ---------- journey / roadmap persistence ----------
if ($path==='/journey/me' && $meth==='GET') {
    $me=current_user_id(true);
    $defaults=['journey_type'=>'other','life_stage'=>'planning','state_code'=>'','household'=>'solo','employment'=>'looking','goals'=>[],'onboarding_done'=>0];
    $st=$pdo->prepare('SELECT * FROM user_journey_profile WHERE user_id=?');$st->execute([$me]);$rawProfile=$st->fetch()?:[];
    $goals=json_decode((string)($rawProfile['goals_json']??'[]'),true);if(!is_array($goals))$goals=[];
    $profile=array_merge($defaults,$rawProfile,['goals'=>$goals,'onboarding_done'=>truthy($rawProfile['onboarding_done']??0)?1:0]);

    $st=$pdo->prepare('SELECT * FROM user_journey_progress WHERE user_id=?');$st->execute([$me]);$progress=[];
    foreach($st->fetchAll() as $row){$sid=(string)($row['step_id']??'');if($sid==='')continue;$progress[$sid]=['status'=>$row['status']??'doing','completed_at'=>$row['completed_at']??null,'updated_at'=>$row['updated_at']??null];}

    $st=$pdo->prepare('SELECT * FROM user_journey_checklist_progress WHERE user_id=?');$st->execute([$me]);$checklist=[];
    foreach($st->fetchAll() as $row){$sid=(string)($row['step_id']??'');$iid=(string)($row['item_id']??'');if($sid===''||$iid==='')continue;$checklist[$sid.'::'.$iid]=['done'=>truthy($row['is_done']??0),'updated_at'=>$row['updated_at']??null];}

    $st=$pdo->prepare('SELECT * FROM user_journey_custom_items WHERE user_id=? ORDER BY sort_order,id');$st->execute([$me]);$custom=$st->fetchAll();
    foreach($custom as &$item){$item['id']=(int)$item['id'];$item['is_done']=truthy($item['is_done']??0);}unset($item);
    response_json(['profile'=>$profile,'progress'=>$progress,'checklist'=>$checklist,'customItems'=>$custom,'custom_items'=>$custom]);
}
if ($path==='/journey/profile' && in_array($meth,['POST','PUT','PATCH'],true)) {
    $me=current_user_id(true);$d=input_all();$goals=$d['goals_json']??($d['goals']??[]);if(is_array($goals))$goals=json_encode($goals,JSON_UNESCAPED_UNICODE);$st=$pdo->prepare('SELECT user_id FROM user_journey_profile WHERE user_id=?');$st->execute([$me]);$exists=$st->fetchColumn();$vals=[clean_string($d['journey_type']??''),clean_string($d['life_stage']??''),clean_string($d['state_code']??''),clean_string($d['household']??''),clean_string($d['employment']??''),$goals,truthy($d['onboarding_done']??true)?1:0,now_sql(),$me];if($exists){$pdo->prepare('UPDATE user_journey_profile SET journey_type=?,life_stage=?,state_code=?,household=?,employment=?,goals_json=?,onboarding_done=?,updated_at=? WHERE user_id=?')->execute($vals);}else{$pdo->prepare('INSERT INTO user_journey_profile (journey_type,life_stage,state_code,household,employment,goals_json,onboarding_done,updated_at,user_id) VALUES (?,?,?,?,?,?,?,?,?)')->execute($vals);}response_json(['ok'=>true]);
}
if ($path==='/journey/progress' && $meth==='GET') {$me=current_user_id(true);$st=$pdo->prepare('SELECT * FROM user_journey_progress WHERE user_id=?');$st->execute([$me]);response_json(['progress'=>$st->fetchAll()]);}
if ($path==='/journey/progress' && $meth==='DELETE') { $me=current_user_id(true);$pdo->prepare('DELETE FROM user_journey_progress WHERE user_id=?')->execute([$me]);$pdo->prepare('DELETE FROM user_journey_checklist_progress WHERE user_id=?')->execute([$me]);$pdo->prepare('UPDATE user_journey_custom_items SET is_done=0,updated_at=? WHERE user_id=?')->execute([now_sql(),$me]);response_json(['ok'=>true]);}
if (($path==='/journey/progress'||preg_match('#^/journey/progress/(.+)$#',$path,$mm)) && in_array($meth,['POST','PUT','PATCH','DELETE'],true)) {
    $me=current_user_id(true);$step=isset($mm[1])?rawurldecode($mm[1]):clean_string(input('step_id',input('stepId','')));if($step==='')fail('step_id required');if($meth==='DELETE'){$pdo->prepare('DELETE FROM user_journey_progress WHERE user_id=? AND step_id=?')->execute([$me,$step]);response_json(['ok'=>true]);}$status=clean_string(input('status',truthy(input('is_done',false))?'done':'doing'));if(in_array($status,['todo','pending','not_started'],true)){$pdo->prepare('DELETE FROM user_journey_progress WHERE user_id=? AND step_id=?')->execute([$me,$step]);response_json(['ok'=>true,'step_id'=>$step,'status'=>'todo']);}$status=in_array($status,['done','complete','completed'],true)?'done':'doing';$done=$status==='done'?now_sql():null;$pdo->prepare('DELETE FROM user_journey_progress WHERE user_id=? AND step_id=?')->execute([$me,$step]);$pdo->prepare('INSERT INTO user_journey_progress (user_id,step_id,status,completed_at,updated_at) VALUES (?,?,?,?,?)')->execute([$me,$step,$status,$done,now_sql()]);response_json(['ok'=>true,'step_id'=>$step,'status'=>$status]);
}
if ((preg_match('#^/journey/checklist/([^/]+)/([^/]+)$#',$path,$mm) || preg_match('#^/journey/checklist/(.+)$#',$path,$mm)) && in_array($meth,['POST','PUT','PATCH','DELETE'],true)) {
    $me=current_user_id(true);$step=rawurldecode($mm[1]);$item=isset($mm[2])?rawurldecode($mm[2]):clean_string(input('item_id',input('itemId','')));if($item==='')fail('item_id required');if($meth==='DELETE'){$pdo->prepare('DELETE FROM user_journey_checklist_progress WHERE user_id=? AND step_id=? AND item_id=?')->execute([$me,$step,$item]);response_json(['ok'=>true]);}$done=truthy(input('is_done',input('done',true)))?1:0;$pdo->prepare('DELETE FROM user_journey_checklist_progress WHERE user_id=? AND step_id=? AND item_id=?')->execute([$me,$step,$item]);$pdo->prepare('INSERT INTO user_journey_checklist_progress (user_id,step_id,item_id,is_done,updated_at) VALUES (?,?,?,?,?)')->execute([$me,$step,$item,$done,now_sql()]);response_json(['ok'=>true]);
}
if ($path==='/journey/custom-items' && $meth==='GET') {$me=current_user_id(true);$st=$pdo->prepare('SELECT * FROM user_journey_custom_items WHERE user_id=? ORDER BY sort_order,id');$st->execute([$me]);$rows=$st->fetchAll();response_json(['items'=>$rows,'custom_items'=>$rows]);}
if ($path==='/journey/custom-items' && $meth==='POST') {$me=current_user_id(true);$step=clean_string(input('step_id',input('stepId','')));$parent=clean_string(input('parent_item_id',input('parentItemId','')))?:null;$title=clean_string(input('title'));if($step===''||$title==='')fail('step_id and title required');$done=truthy(input('is_done',false))?1:0;$sort=(int)input('sort_order',0);$now=now_sql();$pdo->prepare('INSERT INTO user_journey_custom_items (user_id,step_id,parent_item_id,title,is_done,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)')->execute([$me,$step,$parent,$title,$done,$sort,$now,$now]);$id=(int)$pdo->lastInsertId();response_json(['ok'=>true,'id'=>$id,'item'=>['id'=>$id,'step_id'=>$step,'parent_item_id'=>$parent,'title'=>$title,'is_done'=>(bool)$done,'sort_order'=>$sort,'created_at'=>$now,'updated_at'=>$now]],201);}
if (preg_match('#^/journey/custom-items/([^/]+)$#',$path,$mm) && in_array($meth,['PUT','PATCH','DELETE'],true)) {$me=current_user_id(true);$id=(int)$mm[1];if($meth==='DELETE'){$pdo->prepare('DELETE FROM user_journey_custom_items WHERE id=? AND user_id=?')->execute([$id,$me]);response_json(['ok'=>true]);}$d=input_all();$sets=[];$vals=[];foreach(['title','step_id','parent_item_id','is_done','sort_order'] as $f){if(array_key_exists($f,$d)){$sets[]="$f=?";$vals[]=$f==='is_done'?(truthy($d[$f])?1:0):$d[$f];}}if($sets){$sets[]='updated_at=?';$vals[]=now_sql();$vals[]=$id;$vals[]=$me;$pdo->prepare('UPDATE user_journey_custom_items SET '.implode(',',$sets).' WHERE id=? AND user_id=?')->execute($vals);}response_json(['ok'=>true]);}

// ---------- notifications ----------
if ($path==='/notifications' && $meth==='GET') {
    $me=current_user_id(true);
    $st=$pdo->prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 100');
    $st->execute([$me]);
    $rows=[];
    foreach($st->fetchAll() as $r){
        $r['id']=(int)$r['id'];
        $r['desc']=$r['description']??'';
        $r['read']=truthy($r['is_read']??0);
        $r['time']=$r['created_at']??null;
        $rows[]=$r;
    }
    // Header expects the legacy Node array shape: [{title, desc, read, time, ...}]
    response_json($rows);
}
if ($path==='/notifications' && $meth==='POST') {
    $sender=current_user_id(true);
    $recipient=(int)input('recipient_id',input('user_id',0));
    if($recipient<=0||$recipient===$sender)fail('Invalid notification recipient');
    $type=clean_string(input('type','comment'));
    // Regular users can only generate comment/reply/review notifications;
    // moderation, security and account notifications are server-owned.
    if($type!=='comment')fail('Notification type not allowed',403);
    $link=afu_safe_notification_link(clean_string(input('link','')));
    if($link==='')fail('Invalid notification link');
    $title=clean_string(input('title',''));
    $description=clean_string(input('description',input('desc','')));
    if($title===''||strlen($title)>160||strlen($description)>500)fail('Invalid notification text');
    // Constrain to real accounts and avoid unbounded writes from a compromised login.
    $exists=$pdo->prepare('SELECT 1 FROM users WHERE id=? LIMIT 1');$exists->execute([$recipient]);
    if(!$exists->fetchColumn())fail('Recipient not found',404);
    afu_notification_throttle($sender);
    $pdo->prepare('INSERT INTO notifications (user_id,title,description,type,link,is_read,created_at) VALUES (?,?,?,?,?,0,?)')
        ->execute([$recipient,$title,$description,$type,$link,now_sql()]);
    response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId(),'persisted'=>true],201);
}
if ($path==='/notifications/read-all' && in_array($meth,['POST','PATCH'],true)) {$me=current_user_id(true);$pdo->prepare('UPDATE notifications SET is_read=1 WHERE user_id=?')->execute([$me]);response_json(['ok'=>true]);}
if (preg_match('#^/notifications/([^/]+)$#',$path,$mm) && in_array($meth,['POST','PATCH'],true)) {$me=current_user_id(true);$pdo->prepare('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?')->execute([(int)$mm[1],$me]);response_json(['ok'=>true]);}
if (preg_match('#^/notifications/([^/]+)$#',$path,$mm) && $meth==='DELETE') {$me=current_user_id(true);$pdo->prepare('DELETE FROM notifications WHERE id=? AND user_id=?')->execute([(int)$mm[1],$me]);response_json(['ok'=>true]);}

// ---------- chat ----------
if ($path==='/chat/summary' && $meth==='GET') {$me=current_user_id(true);$st=$pdo->prepare('SELECT COUNT(*) FROM chat_messages m JOIN chat_threads t ON t.id=m.thread_id WHERE (t.user1_id=? OR t.user2_id=?) AND m.sender_id<>? AND m.read_at IS NULL');$st->execute([$me,$me,$me]);$count=(int)$st->fetchColumn();response_json(['unread'=>$count,'unread_count'=>$count,'unread_total'=>$count,'unreadCount'=>$count]);}
if ($path==='/chat/threads' && $meth==='GET') {$me=current_user_id(true);$st=$pdo->prepare('SELECT * FROM chat_threads WHERE user1_id=? OR user2_id=? ORDER BY COALESCE(last_message_at,updated_at,created_at) DESC');$st->execute([$me,$me]);$rows=[];foreach($st->fetchAll() as $r){$rows[]=chat_thread_row($r,$me);}response_json(['threads'=>$rows,'items'=>$rows,'data'=>$rows]);}
if ($path==='/chat/threads' && $meth==='POST') {$me=current_user_id(true);$other=(int)input('user_id',input('recipient_id',input('other_user_id',0)));if(!$other)fail('user_id required');if($other===$me)fail('Cannot message yourself');if(!user_profile_row($other))fail('User not found',404);$contextType=clean_string(input('context_type','direct'));$contextId=clean_string(input('context_id',''));$contextLabel=clean_string(input('context_label',''));$st=$pdo->prepare("SELECT * FROM chat_threads WHERE ((user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)) AND COALESCE(context_type,'direct')=? AND COALESCE(context_id,'')=? ORDER BY id DESC LIMIT 1");$st->execute([$me,$other,$other,$me,$contextType,$contextId]);$r=$st->fetch();if(!$r){$pdo->prepare('INSERT INTO chat_threads (user1_id,user2_id,context_type,context_id,context_label,created_at,updated_at) VALUES (?,?,?,?,?,?,?)')->execute([$me,$other,$contextType,$contextId,$contextLabel,now_sql(),now_sql()]);$id=(int)$pdo->lastInsertId();$st=$pdo->prepare('SELECT * FROM chat_threads WHERE id=?');$st->execute([$id]);$r=$st->fetch();}else if($contextLabel!=='' && empty($r['context_label'])){$pdo->prepare('UPDATE chat_threads SET context_label=?,updated_at=? WHERE id=?')->execute([$contextLabel,now_sql(),$r['id']]);$r['context_label']=$contextLabel;} $thread=chat_thread_row($r,$me);response_json(['thread'=>$thread,'item'=>$thread,'id'=>(int)$thread['id']]);}
if (preg_match('#^/chat/threads/([^/]+)/messages$#',$path,$mm) && $meth==='GET') {$me=current_user_id(true);$tid=(int)$mm[1];$st=$pdo->prepare('SELECT * FROM chat_threads WHERE id=? AND (user1_id=? OR user2_id=?)');$st->execute([$tid,$me,$me]);if(!$st->fetch())fail('Thread not found',404);$st=$pdo->prepare('SELECT * FROM chat_messages WHERE thread_id=? ORDER BY id ASC');$st->execute([$tid]);$rows=$st->fetchAll();foreach($rows as &$row){$row['id']=(int)$row['id'];$row['sender_id']=(int)$row['sender_id'];$row['created_at_label']=$row['created_at']??'';}unset($row);response_json(['messages'=>$rows,'items'=>$rows,'data'=>$rows]);}
if (preg_match('#^/chat/threads/([^/]+)/messages$#',$path,$mm) && $meth==='POST') {$me=current_user_id(true);$tid=(int)$mm[1];$body=clean_string(input('body',input('message',input('text',''))));if($body==='')fail('Message required');$st=$pdo->prepare('SELECT * FROM chat_threads WHERE id=? AND (user1_id=? OR user2_id=?)');$st->execute([$tid,$me,$me]);if(!$st->fetch())fail('Thread not found',404);$created=now_sql();$pdo->prepare('INSERT INTO chat_messages (thread_id,sender_id,body,created_at) VALUES (?,?,?,?)')->execute([$tid,$me,$body,$created]);$id=(int)$pdo->lastInsertId();$pdo->prepare('UPDATE chat_threads SET last_message=?,last_message_at=?,updated_at=? WHERE id=?')->execute([$body,$created,$created,$tid]);$item=['id'=>$id,'thread_id'=>$tid,'sender_id'=>$me,'body'=>$body,'created_at'=>$created,'created_at_label'=>$created];response_json(['ok'=>true,'id'=>$id,'message'=>$item,'item'=>$item,'data'=>$item],201);}
if (preg_match('#^/chat/threads/([^/]+)/read$#',$path,$mm) && in_array($meth,['POST','PATCH'],true)) {$me=current_user_id(true);$tid=(int)$mm[1];if(!chat_thread_member($pdo,$tid,$me))fail('Thread not found',404);$pdo->prepare('UPDATE chat_messages SET read_at=? WHERE thread_id=? AND sender_id<>? AND read_at IS NULL')->execute([now_sql(),$tid,$me]);response_json(['ok'=>true]);}

// ---------- CVs ----------
if (in_array($path,['/cvs','/cv','/resumes'],true) && $meth==='GET') {$me=current_user_id(true);$st=$pdo->prepare('SELECT * FROM cvs WHERE user_id=? ORDER BY updated_at DESC,id DESC');$st->execute([$me]);$rows=$st->fetchAll();foreach($rows as &$r){$r['data']=json_decode($r['cv_data']??'{}',true)?:[];}response_json(['cvs'=>$rows,'resumes'=>$rows,'items'=>$rows,'data'=>$rows]);}
if (in_array($path,['/cvs','/cv','/resumes'],true) && $meth==='POST') {$me=current_user_id(true);$name=clean_string(input('cv_name',input('name','My CV')));$data=input('cv_data',input('data',input_all()));if(is_array($data))$data=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);$pdo->prepare('INSERT INTO cvs (user_id,cv_name,cv_data,updated_at) VALUES (?,?,?,?)')->execute([$me,$name,$data,now_sql()]);response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);}
if ((preg_match('#^/(?:cv|get-cv)/([^/]+)$#',$path,$mm)) && $meth==='GET') {$me=current_user_id(true);$id=(int)$mm[1];$st=$pdo->prepare('SELECT * FROM cvs WHERE id=? AND user_id=?');$st->execute([$id,$me]);$r=$st->fetch();if(!$r)fail('CV not found',404);$r['data']=json_decode($r['cv_data']??'{}',true)?:[];response_json($r);}
if ((preg_match('#^/(?:cv|update-cv)/([^/]+)$#',$path,$mm)) && in_array($meth,['PUT','PATCH','POST'],true)) {$me=current_user_id(true);$id=(int)$mm[1];$name=clean_string(input('cv_name',input('name','')));$data=input('cv_data',input('data',null));$sets=[];$vals=[];if($name!==''){$sets[]='cv_name=?';$vals[]=$name;}if($data!==null){if(is_array($data))$data=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);$sets[]='cv_data=?';$vals[]=$data;}$sets[]='updated_at=?';$vals[]=now_sql();$vals[]=$id;$vals[]=$me;$pdo->prepare('UPDATE cvs SET '.implode(',',$sets).' WHERE id=? AND user_id=?')->execute($vals);response_json(['ok'=>true]);}
if (preg_match('#^/cv/([^/]+)$#',$path,$mm) && $meth==='DELETE') {$me=current_user_id(true);$pdo->prepare('DELETE FROM cvs WHERE id=? AND user_id=?')->execute([(int)$mm[1],$me]);response_json(['ok'=>true]);}

// English Basics is initialized only when the glossary or its admin editor is used.
if ($path==='/glossary' || str_starts_with($path,'/glossary/') || $path==='/admin/glossary' || str_starts_with($path,'/admin/glossary/')) {
    require_once __DIR__.'/glossary-basics.php';
    afu_glossary_basics_setup($pdo);
}

// ---------- glossary ----------
// Public dictionary never exposes pending/rejected suggestions, even when ?status= is supplied.
function glossary_safe_slug(PDO $pdo, array $data): string {
    $term=clean_string($data['term']??'');
    if($term==='')fail('Term is required',422);
    if(trim(clean_string($data['definition_ar']??''))==='' && trim(clean_string($data['definition_en']??''))==='')fail('A definition is required',422);
    $duplicate=$pdo->prepare('SELECT id FROM glossary_terms WHERE LOWER(term)=LOWER(?) LIMIT 1');$duplicate->execute([$term]);
    if($duplicate->fetchColumn()!==false)fail('This glossary term already exists',409);
    $provided=clean_string($data['slug']??'');
    $base=strtolower($provided!==''?$provided:$term);
    $base=trim((string)preg_replace('/[^a-z0-9]+/','-',$base),'-');
    if($base==='')$base='term-'.substr(hash('sha256',$term),0,16);
    $base=substr($base,0,100);
    $slug=$base;$suffix=2;
    $check=$pdo->prepare('SELECT id FROM glossary_terms WHERE slug=? LIMIT 1');
    while(true){$check->execute([$slug]);if($check->fetchColumn()===false)break;$slug=$base.'-'.$suffix++;if($suffix>10000)fail('Could not make a unique glossary slug',500);}
    return $slug;
}

if ($path==='/glossary' && $meth==='GET') {$st=$pdo->prepare('SELECT * FROM glossary_terms WHERE status=? ORDER BY is_featured DESC,term ASC');$st->execute(['approved']);$rows=array_map('glossary_row',$st->fetchAll());response_json(['terms'=>$rows,'items'=>$rows,'data'=>$rows,'total'=>count($rows)]);}
if ($path==='/glossary/suggestions' && $meth==='POST') {$me=current_user_id(true);$d=input_all();$pdo->prepare('INSERT INTO glossary_terms (slug,term,category,definition_ar,definition_en,definition_es,example_ar,example_en,example_es,aliases_json,source_url,status,submitted_by,submission_note,is_featured,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([glossary_safe_slug($pdo,$d),clean_string($d['term']??''),clean_string($d['category']??'general'),clean_string($d['definition_ar']??''),clean_string($d['definition_en']??''),clean_string($d['definition_es']??''),clean_string($d['example_ar']??''),clean_string($d['example_en']??''),clean_string($d['example_es']??''),json_encode($d['aliases']??[]),clean_string($d['source_url']??''),'pending',$me,clean_string($d['submission_note']??''),0,now_sql(),now_sql()]);response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);}

// ---------- resources / states ----------
if ($path==='/resources' && $meth==='GET') {
    $where=" WHERE status='approved'";$params=[];
    if(!empty($_GET['category'])){$where.=' AND category=?';$params[]=$_GET['category'];}
    if(!empty($_GET['state'])){$where.=' AND (UPPER(COALESCE(state_code,\'\')) IN (\'\',\'ALL\') OR UPPER(state_code)=?)';$params[]=strtoupper((string)$_GET['state']);}
    $countSt=$pdo->prepare('SELECT COUNT(*) FROM resource_entities'.$where);$countSt->execute($params);$total=(int)$countSt->fetchColumn();
    $limit=max(1,min(100,(int)($_GET['limit']??100)));
    // Backward-compatible paged API for Android/iOS. Existing website pages use offset=0.
    $offset=max(0,min(1000000,(int)($_GET['offset']??0)));
    $st=$pdo->prepare('SELECT * FROM resource_entities'.$where.' ORDER BY is_featured DESC,name ASC LIMIT '.$limit.' OFFSET '.$offset);$st->execute($params);
    $rows=array_map(fn($r)=>resource_row($r,$viewer),$st->fetchAll());
    $hasMore=($offset+count($rows))<$total;
    response_json(['resources'=>$rows,'items'=>$rows,'data'=>$rows,'total_count'=>$total,'shown_count'=>count($rows),'offset'=>$offset,'limit'=>$limit,'has_more'=>$hasMore,'next_offset'=>$hasMore?($offset+count($rows)):null]);
}
if ($path==='/resources/suggestions' && $meth==='POST') {$me=current_user_id(true);$d=input_all();$pdo->prepare('INSERT INTO resource_entities (category,slug,name,description,website_url,referral_url,logo_url,state_code,coverage_label,tags_json,status,submitted_by,submission_note,is_featured,is_official,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([clean_string($d['category']??''),clean_string($d['slug']??strtolower(preg_replace('/\s+/','-',clean_string($d['name']??'')))),clean_string($d['name']??''),clean_string($d['description']??''),clean_string($d['website_url']??$d['website']??''),clean_string($d['referral_url']??''),clean_string($d['logo_url']??''),clean_string($d['state_code']??''),clean_string($d['coverage_label']??''),json_encode($d['tags']??[]),'pending',$me,clean_string($d['submission_note']??''),0,0,now_sql(),now_sql()]);response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);}
if (preg_match('#^/resources/([^/]+)/vote$#',$path,$mm) && in_array($meth,['POST','PUT','PATCH'],true)) {
    $me=current_user_id(true);$id=(int)$mm[1];$vote=(int)input('vote',1);
    $pdo->prepare('DELETE FROM resource_votes WHERE entity_id=? AND user_id=?')->execute([$id,$me]);
    if($vote!==0){$pdo->prepare('INSERT INTO resource_votes (entity_id,user_id,vote,updated_at) VALUES (?,?,?,?)')->execute([$id,$me,$vote>0?1:-1,now_sql()]);}
    $st=$pdo->prepare('SELECT * FROM resource_entities WHERE id=? LIMIT 1');$st->execute([$id]);$entity=$st->fetch();
    response_json(['ok'=>true,'vote'=>$vote>0?1:($vote<0?-1:0),'item'=>$entity?resource_row($entity,$me):null]);
}
if (preg_match('#^/resources/([^/]+)/reviews$#',$path,$mm) && $meth==='GET') {$id=(int)$mm[1];$st=$pdo->prepare('SELECT r.*,u.username FROM resource_reviews r JOIN users u ON u.id=r.user_id WHERE entity_id=? ORDER BY r.updated_at DESC');$st->execute([$id]);$rows=$st->fetchAll();foreach($rows as &$rr){$rr['author_name']=$rr['username']??'User';$rr['rating']=(int)($rr['rating']??0);}unset($rr);response_json(['reviews'=>$rows,'items'=>$rows]);}
if (preg_match('#^/resources/([^/]+)/review$#',$path,$mm) && in_array($meth,['POST','PUT','PATCH'],true)) {
    $me=current_user_id(true);$id=(int)$mm[1];$rating=max(1,min(5,(int)input('rating',5)));$verdict=clean_string(input('verdict',''));$comment=clean_string(input('comment',''));$pros=clean_string(input('pros',''));$cons=clean_string(input('cons',''));$location=clean_string(input('location_label',input('location','')));
    $pdo->prepare('DELETE FROM resource_reviews WHERE entity_id=? AND user_id=?')->execute([$id,$me]);
    $pdo->prepare('INSERT INTO resource_reviews (entity_id,user_id,rating,verdict,comment,pros,cons,location_label,updated_at) VALUES (?,?,?,?,?,?,?,?,?)')->execute([$id,$me,$rating,$verdict,$comment,$pros,$cons,$location,now_sql()]);
    $st=$pdo->prepare('SELECT * FROM resource_entities WHERE id=? LIMIT 1');$st->execute([$id]);$entity=$st->fetch();
    response_json(['ok'=>true,'rating'=>$rating,'verdict'=>$verdict,'comment'=>$comment,'pros'=>$pros,'cons'=>$cons,'location_label'=>$location,'item'=>$entity?resource_row($entity,$me):null]);
}
if (preg_match('#^/resources/([^/]+)/review$#',$path,$mm) && $meth==='DELETE') {
    $me=current_user_id(true);$id=(int)$mm[1];$pdo->prepare('DELETE FROM resource_reviews WHERE entity_id=? AND user_id=?')->execute([$id,$me]);
    $st=$pdo->prepare('SELECT * FROM resource_entities WHERE id=? LIMIT 1');$st->execute([$id]);$entity=$st->fetch();
    response_json(['ok'=>true,'item'=>$entity?resource_row($entity,$me):null]);
}
if (preg_match('#^/state-resources/([^/]+)$#',$path,$mm) && $meth==='GET') {$st=$pdo->prepare('SELECT * FROM state_resources WHERE state_code=? OR state_name=? LIMIT 1');$v=rawurldecode($mm[1]);$st->execute([$v,$v]);$r=$st->fetch();if(!$r)fail('State resource not found',404);response_json($r);}

// ---------- site content ----------
if ($path==='/content/all' && $meth==='GET') {$st=$pdo->prepare("SELECT content_json,updated_at FROM site_content WHERE id='main_data' LIMIT 1");$st->execute();$r=$st->fetch();response_json($r?['custom'=>true,'data'=>json_decode($r['content_json']?:'{}',true),'updated_at'=>$r['updated_at']]:['custom'=>false,'data'=>null]);}
if ($path==='/content/roadmap' && $meth==='GET') {$st=$pdo->prepare("SELECT content_json,updated_at FROM site_content WHERE id='roadmap_data' LIMIT 1");$st->execute();$r=$st->fetch();response_json($r?['custom'=>true,'data'=>json_decode($r['content_json']?:'[]',true),'updated_at'=>$r['updated_at']]:['custom'=>false,'data'=>null]);}
if ($path==='/content/roadmap-v2' && $meth==='GET') {$st=$pdo->prepare("SELECT content_json,updated_at FROM site_content WHERE id='roadmap_v2' LIMIT 1");$st->execute();$r=$st->fetch();response_json($r?['custom'=>true,'data'=>json_decode($r['content_json']?:'{}',true),'updated_at'=>$r['updated_at']]:['custom'=>false,'data'=>null]);}
if ($path==='/content/learn' && $meth==='GET') {
    $learnContent=content_read('learn_america_v1');
    // The DB remains the only learning-content store. Media URLs are resolved
    // against the configured site origin so web and mobile use the same links.
    $base=rtrim((string)(cfg('app')['base_url']??''),'/');
    $mediaUrl=static function (mixed $url) use ($base): mixed {
        if (!is_string($url) || $url==='' || $base==='') return $url;
        return (str_starts_with($url,'/learn-assets/') || str_starts_with($url,'/api/learn/currency-photo?')) ? $base.$url : $url;
    };
    if (is_array($learnContent['data']??null)) {
        // Stage 13: never display the exact accidental QA currency entry.
        if (is_array($learnContent['data']['currency_items']??null)) {
            $learnContent['data']['currency_items']=array_values(array_filter(
                $learnContent['data']['currency_items'],
                static fn($row)=> !is_array($row) || (string)($row['id']??'')!=='new_1792709673614'
            ));
        }
        // The DB currently holds only five FRONT photos. Do not manufacture
        // /api/learn/currency-photo URLs for missing backs or other bills.
        $stored=[];
        try {
            $q=$pdo->query('SELECT item_id,side FROM learn_currency_media');
            foreach ($q->fetchAll() as $row) {
                $stored[(string)$row['item_id']][(string)$row['side']]=true;
            }
        } catch (Throwable $ignored) { /* Older databases may lack the media table. */ }
        $localImages=['penny'=>'penny.png','nickel'=>'nickel.png','dime'=>'dime.png','quarter'=>'quarter.png','bill-1'=>'dollar1.png'];
        if (is_array($learnContent['data']['currency_items']??null)) {
            foreach ($learnContent['data']['currency_items'] as &$currency) {
                if (!is_array($currency)) continue;
                $id=(string)($currency['id']??'');
                $local=isset($localImages[$id])?'/learn-assets/currency/'.$localImages[$id]:'';
                $hasStatic=$local!=='' && is_file(dirname(__DIR__).$local);
                foreach (['front','back'] as $side) {
                    $key=$side.'_local';
                    $fallback=$side.'_fallback';
                    if (!empty($stored[$id][$side])) {
                        $currency[$key]=$mediaUrl('/api/learn/currency-photo?item='.rawurlencode($id).'&side='.$side);
                        // If a persisted photo cannot be served, show a known local
                        // image before attempting the official remote resource.
                        if ($side==='front' && $hasStatic) $currency[$fallback]=$mediaUrl($local);
                        elseif (empty($currency[$fallback])) $currency[$fallback]=$currency[$side]??'';
                    } elseif ($side==='front' && $hasStatic) {
                        $currency[$key]=$mediaUrl($local);
                        if (empty($currency[$fallback])) $currency[$fallback]=$currency[$side]??'';
                    } else {
                        // Seed JSON may contain a stale API URL for every banknote.
                        // Keep the actual official image link from the DB instead.
                        unset($currency[$key]);
                        if (empty($currency[$fallback])) $currency[$fallback]=$currency[$side]??'';
                    }
                }
            }
            unset($currency);
        }
        $quizImages=['q-money-1'=>'quarter.png','q-money-7'=>'nickel.png'];
        foreach (['quiz_bank','road_signs','life_guides'] as $section) {
            if (!is_array($learnContent['data'][$section]??null)) continue;
            foreach ($learnContent['data'][$section] as &$entry) {
                if (!is_array($entry)) continue;
                if ($section==='quiz_bank') {
                    $qid=(string)($entry['id']??'');
                    if (isset($quizImages[$qid])) {
                        $local='/learn-assets/currency/'.$quizImages[$qid];
                        if (is_file(dirname(__DIR__).$local)) $entry['image_local']=$local;
                    }
                }
                foreach (['image','image_local'] as $field) {
                    if (isset($entry[$field])) $entry[$field]=$mediaUrl($entry[$field]);
                }
            }
            unset($entry);
        }
    }
    response_json($learnContent);
}
if ($path==='/content/status' && $meth==='GET') {
    $counts=[]; foreach(['users','posts','marketplace_listings','community_groups','community_places','glossary_terms','resource_entities','state_resources','site_content','airports'] as $t){ try{$counts[$t]=(int)$pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();}catch(Throwable $e){$counts[$t]=null;} }
    try{$counts['community_places_curated']=(int)$pdo->query("SELECT COUNT(*) FROM community_places WHERE COALESCE(is_seeded,0)=1")->fetchColumn();}catch(Throwable $e){$counts['community_places_curated']=null;}
    $states=[]; try{$q=$pdo->query("SELECT state,COUNT(*) AS count FROM community_places WHERE status IS NULL OR status IN ('approved','active','published') GROUP BY state ORDER BY state");$states=$q->fetchAll();}catch(Throwable $e){}
    $curatedStates=[]; try{$q=$pdo->query("SELECT state,COUNT(*) AS count FROM community_places WHERE COALESCE(is_seeded,0)=1 AND (status IS NULL OR status IN ('approved','active','published')) GROUP BY state ORDER BY state");$curatedStates=$q->fetchAll();}catch(Throwable $e){}
    $learn=content_read('learn_america_v1');
    $meta=[]; if(is_sqlite()){try{$q=$pdo->query("SELECT meta_key,meta_value FROM afu_meta WHERE meta_key IN ('dataset_kind','dataset_scope','unified_demo_baseline','architecture_version','platform_owner_public_id','platform_owner_username')");foreach($q->fetchAll() as $row){$meta[(string)$row['meta_key']]=$row['meta_value'];}}catch(Throwable $e){}}
    response_json(['ok'=>true,'environment'=>runtime_environment(),'release'=>runtime_release(),'counts'=>$counts,'directory_states'=>$states,'curated_directory_states'=>$curatedStates,'learn_in_database'=>(bool)($learn['custom']??false),'meta'=>$meta,'database_path'=>is_sqlite()?(cfg('db')['sqlite_path']??null):null]);
}

// ---------- verification ----------
if (in_array($path,['/verification/request','/verifications','/verifications/apply'],true) && $meth==='POST') {
    $me=current_user_id(true);
    $d=input_all();
    $phone=clean_string($d['phone_number']??$d['phone']??'');
    $proofType=clean_string($d['proof_type']??$d['type']??'');
    $proofInfo=clean_string($d['proof_info']??$d['proof']??'');
    $allowedProof=['state_id','driver_license','passport','work_license','business_registration','professional_license','other'];
    if($phone==='') fail('Phone number is required',422,['field'=>'phone_number']);
    if($proofType==='' || !in_array($proofType,$allowedProof,true)) fail('Valid proof type is required',422,['field'=>'proof_type']);
    $doc=upload_one('document','documents');
    $docUrl=$doc?:clean_string($d['document_url']??'');
    if($docUrl==='' || afu_private_document_path($docUrl)==='') fail('A valid uploaded document is required',422,['field'=>'document']);
    $pdo->prepare("INSERT INTO verification_requests (user_id,proof_type,proof_info,phone_number,document_url,status,created_at) VALUES (?,?,?,?,?,'pending',?)")
        ->execute([$me,$proofType,$proofInfo,$phone,$docUrl,now_sql()]);
    response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId(),'status'=>'pending'],201);
}
if (in_array($path,['/verifications/status','/verification/status'],true) && $meth==='GET') {
    $me=current_user_id(true);
    $st=$pdo->prepare('SELECT * FROM verification_requests WHERE user_id=? ORDER BY id DESC LIMIT 1');$st->execute([$me]);$r=$st->fetch();
    response_json($r?afu_signed_verification_row($r):['status'=>user_profile_row($me)['is_verified']?'approved':'none']);
}
if (in_array($path,['/verifications','/verification/request'],true) && $meth==='GET') {
    $me=current_user_id(true);
    $st=$pdo->prepare('SELECT * FROM verification_requests WHERE user_id=? ORDER BY id DESC');$st->execute([$me]);$rows=array_map('afu_signed_verification_row',$st->fetchAll());
    response_json(['items'=>$rows,'requests'=>$rows,'data'=>$rows]);
}

// ---------- favorite collections ----------
if ($path==='/favorites/collections' && $meth==='GET') {
    $me=current_user_id(true);ensure_default_favorite_collection($me);
    $st=$pdo->prepare('SELECT c.*,COUNT(i.id) AS item_count FROM favorite_collections c LEFT JOIN favorite_items i ON i.collection_id=c.id WHERE c.user_id=? GROUP BY c.id ORDER BY c.updated_at DESC,c.id DESC');
    $st->execute([$me]);response_json(['items'=>$st->fetchAll()]);
}
if ($path==='/favorites/collections' && $meth==='POST') {
    $me=current_user_id(true);$name=clean_string(input('name',''));
    if($name==='') fail('Collection name is required',422);
    try{$pdo->prepare('INSERT INTO favorite_collections (user_id,name,created_at,updated_at) VALUES (?,?,?,?)')->execute([$me,$name,now_sql(),now_sql()]);}
    catch(Throwable $e){fail('A collection with this name already exists',409);}
    $id=(int)$pdo->lastInsertId();response_json(['ok'=>true,'collection'=>['id'=>$id,'name'=>$name,'item_count'=>0]],201);
}
if (preg_match('#^/favorites/collections/(\d+)$#',$path,$fm) && in_array($meth,['PATCH','PUT'],true)) {
    $me=current_user_id(true);$name=clean_string(input('name',''));if($name==='')fail('Collection name is required',422);
    $pdo->prepare('UPDATE favorite_collections SET name=?,updated_at=? WHERE id=? AND user_id=?')->execute([$name,now_sql(),(int)$fm[1],$me]);
    response_json(['ok'=>true]);
}
if (preg_match('#^/favorites/collections/(\d+)$#',$path,$fm) && $meth==='DELETE') {
    $me=current_user_id(true);$id=(int)$fm[1];
    $st=$pdo->prepare('SELECT name FROM favorite_collections WHERE id=? AND user_id=?');$st->execute([$id,$me]);$name=(string)($st->fetchColumn()?:'');
    if(strtolower($name)==='favorites') fail('The default Favorites collection cannot be deleted',409);
    $pdo->prepare('DELETE FROM favorite_items WHERE collection_id=? AND user_id=?')->execute([$id,$me]);
    $pdo->prepare('DELETE FROM favorite_collections WHERE id=? AND user_id=?')->execute([$id,$me]);
    response_json(['ok'=>true]);
}
if ($path==='/favorites/items' && $meth==='GET') {
    $me=current_user_id(true);$collectionId=(int)($_GET['collection_id']??0);
    $sql='SELECT i.*,c.name AS collection_name FROM favorite_items i JOIN favorite_collections c ON c.id=i.collection_id WHERE i.user_id=?';$params=[$me];
    if($collectionId){$sql.=' AND i.collection_id=?';$params[]=$collectionId;}$sql.=' ORDER BY i.created_at DESC';
    $st=$pdo->prepare($sql);$st->execute($params);$rows=$st->fetchAll();
    // Do not confuse the date a listing was bookmarked with its publication date.
    // This is read-only, works for both MySQL and SQLite, and never changes favorites.
    foreach($rows as &$r){
        $r['meta']=json_decode($r['meta_json']??'{}',true)?:[];
        $kind=strtolower((string)($r['item_type']??''));
        $listingId=(int)preg_replace('/\D+/','',(string)($r['item_id']??''));
        $r['listing_created_at']=null;
        if($listingId>0){
            if(in_array($kind,['services','jobs','housing','products','marketplace','listing'],true)){
                $created=$pdo->prepare('SELECT created_at FROM marketplace_listings WHERE id=? LIMIT 1');
            }elseif(in_array($kind,['places','place'],true)){
                $created=$pdo->prepare('SELECT created_at FROM community_places WHERE id=? LIMIT 1');
            }elseif(in_array($kind,['groups','group'],true)){
                $created=$pdo->prepare('SELECT created_at FROM community_groups WHERE id=? LIMIT 1');
            }else{$created=null;}
            if($created){$created->execute([$listingId]);$r['listing_created_at']=$created->fetchColumn()?:null;}
        }
    }
    unset($r);
    response_json(['items'=>$rows]);
}
if ($path==='/favorites/status' && $meth==='GET') {
    $me=current_user_id(true);$type=clean_string($_GET['item_type']??'listing');$itemId=clean_string($_GET['item_id']??'');
    $st=$pdo->prepare('SELECT collection_id FROM favorite_items WHERE user_id=? AND item_type=? AND item_id=?');$st->execute([$me,$type,$itemId]);
    $ids=array_map('intval',array_column($st->fetchAll(),'collection_id'));response_json(['saved'=>!empty($ids),'collection_ids'=>$ids]);
}
if ($path==='/favorites/items' && $meth==='POST') {
    $me=current_user_id(true);$collectionId=(int)input('collection_id',0);$type=clean_string(input('item_type','listing'));$itemId=clean_string(input('item_id',''));
    if(!$collectionId)$collectionId=ensure_default_favorite_collection($me);if($itemId==='')fail('Item id is required',422);
    $st=$pdo->prepare('SELECT id FROM favorite_collections WHERE id=? AND user_id=?');$st->execute([$collectionId,$me]);if(!$st->fetchColumn())fail('Collection not found',404);
    $title=clean_string(input('title',''));$url=clean_string(input('url',''));$image=clean_string(input('image_url',input('image','')));
    $meta=input('meta',[]);if(!is_array($meta))$meta=[];
    if(is_sqlite()){
        $pdo->prepare('INSERT INTO favorite_items (collection_id,user_id,item_type,item_id,title,url,image_url,meta_json,created_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(collection_id,item_type,item_id) DO UPDATE SET title=excluded.title,url=excluded.url,image_url=excluded.image_url,meta_json=excluded.meta_json')
            ->execute([$collectionId,$me,$type,$itemId,$title,$url,$image,json_encode($meta,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),now_sql()]);
    }else{
        $pdo->prepare('INSERT INTO favorite_items (collection_id,user_id,item_type,item_id,title,url,image_url,meta_json,created_at) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title),url=VALUES(url),image_url=VALUES(image_url),meta_json=VALUES(meta_json)')
            ->execute([$collectionId,$me,$type,$itemId,$title,$url,$image,json_encode($meta,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),now_sql()]);
    }
    $pdo->prepare('UPDATE favorite_collections SET updated_at=? WHERE id=?')->execute([now_sql(),$collectionId]);
    response_json(['ok'=>true,'saved'=>true],201);
}
if ($path==='/favorites/items' && $meth==='DELETE') {
    $me=current_user_id(true);$collectionId=(int)input('collection_id',(int)($_GET['collection_id']??0));$type=clean_string(input('item_type',$_GET['item_type']??'listing'));$itemId=clean_string(input('item_id',$_GET['item_id']??''));
    if($collectionId){$pdo->prepare('DELETE FROM favorite_items WHERE user_id=? AND collection_id=? AND item_type=? AND item_id=?')->execute([$me,$collectionId,$type,$itemId]);}
    else{$pdo->prepare('DELETE FROM favorite_items WHERE user_id=? AND item_type=? AND item_id=?')->execute([$me,$type,$itemId]);}
    response_json(['ok'=>true,'saved'=>false]);
}

// ---------- reports/support/appeals ----------
if ($path==='/reports' && $meth==='POST') {$me=current_user_id(true);$pdo->prepare('INSERT INTO reports (reporter_id,target_type,target_id,reason,details,status,created_at) VALUES (?,?,?,?,?,\'pending\',?)')->execute([$me,clean_string(input('target_type','')),clean_string(input('target_id','')),clean_string(input('reason','')),clean_string(input('details','')),now_sql()]);response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);}

// One moderated information-suggestion workflow for ALL public item types.
// Account required to write, public read includes only approved rows.
function afu_entity_ref(string $rawKind, int $id): array {
    $kind=strtolower(trim($rawKind));
    if ($id <= 0) fail('Invalid item ID',422);
    if ($kind==='places'||$kind==='place') return ['place','community_places','name','created_by'];
    if ($kind==='groups'||$kind==='group') return ['group','community_groups','name','created_by'];
    if (in_array($kind,['services','jobs','housing','products','listing','marketplace'],true))
        return ['listing','marketplace_listings','title','user_id'];
    fail('Unsupported item type',422);
}
function afu_entity_public(PDO $pdo, string $kind, int $id): array {
    [$type,$table,$label,$owner]=afu_entity_ref($kind,$id);
    // Some marketplace routes use public_id; prefer canonical numeric ID when present.
    $st=$pdo->prepare('SELECT * FROM `'.$table.'` WHERE id=? LIMIT 1');$st->execute([$id]);$item=$st->fetch();
    if(!$item&&$type==='listing'){$st=$pdo->prepare('SELECT * FROM marketplace_listings WHERE public_id=? LIMIT 1');$st->execute([$id]);$item=$st->fetch();}
    if(!$item) fail('Public item not found',404);
    $status=strtolower(trim((string)($item['status']??'approved')));
    if(!in_array($status,['','approved','active','published'],true)) fail('Item is not public',404);
    if($type==='listing' && array_key_exists('is_active',$item) && $item['is_active']!==null && (int)$item['is_active']===0) fail('Item is inactive',404);
    return [$type,(int)$item['id'],(int)($item[$owner]??0),(string)($item[$label]??'')];
}
if (preg_match('#^/entity-suggestions/([a-z]+)/([0-9]+)/(approved)$#',$path,$em) && $meth==='GET') {
    [$type,$id]=afu_entity_public($pdo,$em[1],(int)$em[2]);
    $st=$pdo->prepare("SELECT id,field_name,proposed_value,details,images_json,reviewed_at FROM entity_update_suggestions WHERE entity_type=? AND entity_id=? AND status='approved' ORDER BY id DESC LIMIT 100");
    $st->execute([$type,$id]);$items=$st->fetchAll();
    foreach($items as &$s){$s['images']=json_array($s['images_json']??'[]');unset($s['images_json']);}unset($s);
    response_json(['items'=>$items,'count'=>count($items)]);
}
if (preg_match('#^/entity-suggestions/([a-z]+)/([0-9]+)$#',$path,$em) && $meth==='POST') {
    $me=current_user_id(true);
    [$type,$id,$owner,$title]=afu_entity_public($pdo,$em[1],(int)$em[2]);
    $field=strtolower(clean_string(input('field_name',input('field','other'))));
    $aliases=['photo'=>'images','image'=>'images','photos'=>'images','url'=>'website','site'=>'website','map'=>'google_maps_url','maps'=>'google_maps_url','telephone'=>'phone','tel'=>'phone'];
    if(isset($aliases[$field]))$field=$aliases[$field];
    $allowed=['phone','website','google_maps_url','address','city','email','hours','notes','images','other'];
    if(!in_array($field,$allowed,true))$field='other';
    $value=clean_string(input('proposed_value',input('value','')));$details=clean_string(input('details',''));
    $images=upload_many('images','suggestions');if(!$images)$images=json_array(input('images',[]));$images=persist_media_images($images,'suggestions');
    if($value===''&&$details===''&&!$images)fail('Add a value, details, or photo',422);
    $st=$pdo->prepare("INSERT INTO entity_update_suggestions (entity_type,entity_id,submitter_id,field_name,proposed_value,details,images_json,status,created_at) VALUES (?,?,?,?,?,?,?,'pending',?)");
    $st->execute([$type,$id,$me,$field,$value,$details,json_encode($images,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),now_sql()]);
    $sid=(int)$pdo->lastInsertId();
    moderation_event('entity_suggestion',$sid,$me,'submitted',null,'pending','Information submitted for review.',$me,['entity_type'=>$type,'entity_id'=>$id]);
    /* Inline confirmation; no self-notification. */
    if($owner>0 && $owner!==$me)notify_user($owner,'New information suggestion','Someone suggested an update for '.$title.'.','place_update_suggestion','/admin');
    response_json(['ok'=>true,'id'=>$sid,'status'=>'pending'],201);
}

// ---------- community place data enrichment suggestions ----------
// Approved place suggestions are public only after moderation. Never expose submitter email or pending content.
if (preg_match('#^/community/places/(\d+)/approved-updates$#',$path,$mm) && $meth==='GET') {
    $placeId=(int)$mm[1];
    $ps=$pdo->prepare('SELECT id,status FROM community_places WHERE id=? LIMIT 1');
    $ps->execute([$placeId]);$place=$ps->fetch();
    if(!$place || !in_array(strtolower((string)($place['status']??'')),['approved','active','published'],true)) fail('Place not found',404);
    $q=$pdo->prepare("SELECT id,field_name,proposed_value,details,images_json,reviewed_at FROM entity_update_suggestions WHERE entity_type='place' AND entity_id=? AND status='approved' ORDER BY id DESC LIMIT 100");
    $q->execute([$placeId]);$items=$q->fetchAll();
    foreach($items as &$item){$item['images']=json_array($item['images_json']??'[]');unset($item['images_json']);}unset($item);
    response_json(['items'=>$items,'count'=>count($items)]);
}
if (preg_match('#^/community/places/(\d+)/suggestions$#',$path,$mm) && $meth==='POST') {
    $me=current_user_id(true);$placeId=(int)$mm[1];
    $st=$pdo->prepare("SELECT id,name,status,created_by FROM community_places WHERE id=? LIMIT 1");$st->execute([$placeId]);$place=$st->fetch();if(!$place)fail('Place not found',404);
    $status=strtolower(trim((string)($place['status']??'approved')));if($status!==''&&!in_array($status,['approved','active','published'],true))fail('Place is not public',409);
    $field=strtolower(clean_string(input('field_name',input('field','other'))));
    $aliases=['photo'=>'images','image'=>'images','photos'=>'images','url'=>'website','site'=>'website','map'=>'google_maps_url','maps'=>'google_maps_url','google_maps'=>'google_maps_url','telephone'=>'phone','tel'=>'phone'];if(isset($aliases[$field]))$field=$aliases[$field];
    $allowed=['phone','website','google_maps_url','address','city','email','hours','notes','images','other'];if(!in_array($field,$allowed,true))$field='other';
    $value=clean_string(input('proposed_value',input('value','')));$details=clean_string(input('details',''));
    $images=upload_many('images','suggestions');if(!$images)$images=json_array(input('images',[]));$images=persist_media_images($images,'suggestions');
    if($value===''&&$details===''&&!$images)fail('Add a value, details, or photo',422);
    $pdo->prepare("INSERT INTO entity_update_suggestions (entity_type,entity_id,submitter_id,field_name,proposed_value,details,images_json,status,created_at) VALUES ('place',?,?,?,?,?,?, 'pending',?)")
        ->execute([$placeId,$me,$field,$value,$details,json_encode($images,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),now_sql()]);
    $sid=(int)$pdo->lastInsertId();moderation_event('place_suggestion',$sid,$me,'submitted',null,'pending','Place information submitted for review.',$me,['place_id'=>$placeId]);/* Inline confirmation; no self-notification. */$ownerId=(int)($place['created_by']??0);if($ownerId>0 && $ownerId!==$me)notify_user($ownerId,'New place information suggestion','A user suggested an update for '.(string)$place['name'].'.','place_update_suggestion','/admin');
    response_json(['ok'=>true,'id'=>$sid,'status'=>'pending','message'=>'Suggestion sent for admin review.'],201);
}
function afu_suggestion_decorate(PDO $pdo, array &$row): void {
    $type=strtolower((string)($row['entity_type']??'place'));
    $id=(int)($row['entity_id']??0);
    $prefix=['place'=>'place','group'=>'group','listing'=>'listing'][$type]??'place';
    $row['public_link']='/marketplace/item/'.$prefix.'_'.$id;
    if($type==='place')return;
    if($type==='group'){$st=$pdo->prepare('SELECT name,city,state FROM community_groups WHERE id=?');}
    elseif($type==='listing'){$st=$pdo->prepare('SELECT title AS name,city,state FROM marketplace_listings WHERE id=?');}
    else return;
    $st->execute([$id]);$item=$st->fetch();
    if($item){$row['place_name']=(string)($item['name']??'');$row['place_city']=(string)($item['city']??'');$row['place_state']=(string)($item['state']??'');}
}

if ($path==='/me/place-update-suggestions' && $meth==='GET') {
    $me=current_user_id(true);$st=$pdo->prepare("SELECT s.*,p.name AS place_name FROM entity_update_suggestions s LEFT JOIN community_places p ON p.id=s.entity_id AND s.entity_type=\'place\' WHERE s.submitter_id=? ORDER BY s.id DESC");$st->execute([$me]);$rows=$st->fetchAll();foreach($rows as &$r){$r['images']=json_array($r['images_json']??'[]');afu_suggestion_decorate($pdo,$r);}unset($r);response_json(['items'=>$rows,'suggestions'=>$rows]);
}
// User correction of THEIR OWN rejected/pending information suggestion, on the SAME row.
// An approved suggestion cannot be edited here because its information may already be published.
if (preg_match('#^/me/place-update-suggestions/(\d+)/resubmit$#',$path,$mm) && in_array($meth,['PATCH','POST'],true)) {
    $me=current_user_id(true);$sid=(int)$mm[1];
    $st=$pdo->prepare('SELECT * FROM entity_update_suggestions WHERE id=? AND submitter_id=? LIMIT 1');
    $st->execute([$sid,$me]);$old=$st->fetch();if(!$old)fail('Suggestion not found',404);
    $previous=strtolower((string)($old['status']??'pending'));
    if(!in_array($previous,['rejected','pending','withdrawn','revoked'],true))fail('Only pending, rejected, withdrawn or revoked suggestions can be corrected',409);
    $d=input_all();
    $field=strtolower(clean_string($d['field_name']??$old['field_name']));
    $allowed=['phone','website','google_maps_url','address','city','email','hours','notes','images','other'];
    if(!in_array($field,$allowed,true))fail('Unsupported information type',422);
    $value=clean_string($d['proposed_value']??$old['proposed_value']);
    $details=clean_string($d['details']??$old['details']);
    $images=json_array($old['images_json']??'[]');
    if(isset($_FILES['images'])){$fresh=persist_media_images(upload_many('images','suggestions'),'suggestions');$images=array_values(array_unique(array_merge($images,$fresh)));}
    if($value==='' && $details==='' && !$images)fail('Add information or an image before resubmitting',422);
    $st=$pdo->prepare("UPDATE entity_update_suggestions SET field_name=?,proposed_value=?,details=?,images_json=?,status='pending',admin_reason=NULL,reviewed_by=NULL,reviewed_at=NULL,applied_at=NULL WHERE id=? AND submitter_id=? AND status IN ('pending','rejected','withdrawn','revoked')");
    $st->execute([$field,$value,$details,json_encode($images,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),$sid,$me]);
    if(!$st->rowCount())fail('Suggestion changed; refresh and try again',409);
    moderation_event('place_suggestion',$sid,$me,'resubmitted',$previous,'pending','User corrected their place information suggestion.',$me,['place_id'=>(int)$old['entity_id']]);
    /* Inline confirmation; no self-notification. */
    response_json(['ok'=>true,'id'=>$sid,'status'=>'pending','message'=>'Your corrected information is pending review.']);
}
// An owner can withdraw their own mistaken contribution. It disappears from public
// approved-updates immediately, but the audit and original submission remain intact.
if (preg_match('#^/me/place-update-suggestions/(\d+)/withdraw$#',$path,$mm) && in_array($meth,['PATCH','POST'],true)) {
    $me=current_user_id(true);$sid=(int)$mm[1];$st=$pdo->prepare('SELECT * FROM entity_update_suggestions WHERE id=? AND submitter_id=? LIMIT 1');$st->execute([$sid,$me]);$old=$st->fetch();if(!$old)fail('Suggestion not found',404);
    $prev=strtolower((string)($old['status']??'pending'));if(!in_array($prev,['pending','rejected','approved','revoked'],true))fail('Suggestion cannot be withdrawn in this state',409);
    $upd=$pdo->prepare("UPDATE entity_update_suggestions SET status='withdrawn',reviewed_at=? WHERE id=? AND submitter_id=? AND status=?");$upd->execute([now_sql(),$sid,$me,$prev]);if(!$upd->rowCount())fail('Suggestion changed; reload',409);
    moderation_event('place_suggestion',$sid,$me,'withdrawn',$prev,'withdrawn','Withdrawn by contributor',$me,['place_id'=>(int)$old['entity_id']]);
    /* Inline confirmation; no self-notification. */
    response_json(['ok'=>true,'status'=>'withdrawn','id'=>$sid]);
}
if ($path==='/appeals/contact' && $meth==='POST') {$me=current_user_id(false);$u=$me?user_profile_row($me):null;$pdo->prepare('INSERT INTO appeals (user_id,username,email,message,status,created_at) VALUES (?,?,?,?,\'pending\',?)')->execute([$me,$u['username']??clean_string(input('username','')),$u['email']??clean_string(input('email','')),clean_string(input('message','')),now_sql()]);response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);}
if (in_array($path,['/support','/support/ticket'],true) && $meth==='POST') {$pdo->prepare('INSERT INTO support_tickets (name,email,subject,message,status,created_at) VALUES (?,?,?,?,\'open\',?)')->execute([clean_string(input('name','')),clean_string(input('email','')),clean_string(input('subject','')),clean_string(input('message','')),now_sql()]);response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);}

// ---------- user-to-user reviews ----------
// The default scope preserves the original API for older mobile builds.
// scope=all includes public reviews AUTHORED by this user as well as reviews RECEIVED.
// All sources are paged in SQL; no per-listing N+1 requests.
if ((preg_match('#^/users/([^/]+)/reviews$#',$path,$mm)||preg_match('#^/reviews/user/([^/]+)$#',$path,$mm)) && $meth==='GET') {
    $target=user_lookup(rawurldecode($mm[1]));if(!$target)fail('User not found',404);$uid=(int)$target['id'];
    [$page,$limit,$offset]=afu_page();
    $activity=($_GET['scope']??'')==='all';
    $parts=[
        "SELECT 'profile' src,id,created_at FROM reviews WHERE user_id=?",
        "SELECT 'marketplace' src,mr.id,mr.created_at FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.owner_user_id=?",
    ];
    $args=[$uid,$uid];
    if($activity){
        $parts[]="SELECT 'profile_written' src,id,created_at FROM reviews WHERE author_id=? AND user_id<>?";$args[]=$uid;$args[]=$uid;
        $parts[]="SELECT 'marketplace_written' src,mr.id,mr.created_at FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.user_id=? AND (mr.owner_user_id IS NULL OR mr.owner_user_id<>?) AND LOWER(COALESCE(NULLIF(ml.status,''),'approved')) IN ('approved','active','published')";$args[]=$uid;$args[]=$uid;
        $parts[]="SELECT 'place_written' src,r.id,r.created_at FROM place_reviews r JOIN community_places p ON p.id=r.place_id WHERE r.user_id=? AND LOWER(COALESCE(NULLIF(p.status,''),'approved')) IN ('approved','active','published')";$args[]=$uid;
        $parts[]="SELECT 'group_written' src,r.id,r.created_at FROM group_reviews r JOIN community_groups g ON g.id=r.group_id WHERE r.user_id=? AND LOWER(COALESCE(NULLIF(g.status,''),'approved')) IN ('approved','active','published')";$args[]=$uid;
        $parts[]="SELECT 'resource_written' src,r.entity_id AS id,r.updated_at AS created_at FROM resource_reviews r JOIN resource_entities e ON e.id=r.entity_id WHERE r.user_id=? AND LOWER(COALESCE(e.status,'pending')) IN ('approved','active','published')";$args[]=$uid;
    }
    $union=implode(' UNION ALL ',$parts);
    $st=$pdo->prepare("SELECT COUNT(*) FROM ($union) review_activity");$st->execute($args);$total=(int)$st->fetchColumn();
    $st=$pdo->prepare("SELECT src,id FROM ($union) review_activity ORDER BY created_at DESC,src ASC,id DESC LIMIT $limit OFFSET $offset");$st->execute($args);
    $getProfile=$pdo->prepare('SELECT * FROM reviews WHERE id=? AND user_id=?');
    $getMarket=$pdo->prepare('SELECT mr.*,ml.id live_id,ml.public_id live_public_id,ml.title live_title,ml.type live_type FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.id=? AND mr.owner_user_id=?');
    $getProfileWritten=$pdo->prepare('SELECT r.*,u.username target_username,u.public_id target_public_id FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.id=? AND r.author_id=?');
    $getMarketWritten=$pdo->prepare("SELECT mr.*,ml.id live_id,ml.public_id live_public_id,ml.title live_title,ml.type live_type FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.id=? AND mr.user_id=? AND LOWER(COALESCE(NULLIF(ml.status,''),'approved')) IN ('approved','active','published')");
    $getPlaceWritten=$pdo->prepare("SELECT r.*,p.name item_name FROM place_reviews r JOIN community_places p ON p.id=r.place_id WHERE r.id=? AND r.user_id=? AND LOWER(COALESCE(NULLIF(p.status,''),'approved')) IN ('approved','active','published')");
    $getGroupWritten=$pdo->prepare("SELECT r.*,g.name item_name FROM group_reviews r JOIN community_groups g ON g.id=r.group_id WHERE r.id=? AND r.user_id=? AND LOWER(COALESCE(NULLIF(g.status,''),'approved')) IN ('approved','active','published')");
    $getResourceWritten=$pdo->prepare("SELECT r.*,e.name item_name,e.category item_category FROM resource_reviews r JOIN resource_entities e ON e.id=r.entity_id WHERE r.entity_id=? AND r.user_id=? AND LOWER(COALESCE(e.status,'pending')) IN ('approved','active','published')");
    $selectors=['profile'=>$getProfile,'marketplace'=>$getMarket,'profile_written'=>$getProfileWritten,'marketplace_written'=>$getMarketWritten,'place_written'=>$getPlaceWritten,'group_written'=>$getGroupWritten,'resource_written'=>$getResourceWritten];
    $rows=[];
    foreach($st->fetchAll() as $ref){
        $src=(string)$ref['src'];$q=$selectors[$src]??null;if(!$q)continue;
        $q->execute([(int)$ref['id'],$uid]);$r=$q->fetch();if(!$r)continue;
        $written=str_ends_with($src,'_written');
        $authorId=$written?$uid:(int)(($src==='profile')?($r['author_id']??0):($r['user_id']??0));
        $author=public_user_profile(user_profile_row($authorId)?:legacy_deleted_user_profile($authorId))?:[];
        $r['author']=$author;if($activity)$r['review_relation']=$written?'written':'received';
        if($src==='profile' || $src==='profile_written'){
            $r['stars']=(int)$r['rating'];$r['review_source']='profile';$r['reviewer_id']=$authorId;
            $r['item_exists']=$written;$r['item_deleted']=false;
            if($written){$r['item_title']=$r['target_username']??'User';$r['item_href']='/u/'.rawurlencode((string)($r['target_public_id']?:$r['user_id']));$r['item_type']='profile';}
        }elseif($src==='marketplace' || $src==='marketplace_written'){
            $live=isset($r['live_id'])&&$r['live_id']!==null;$deleted=truthy($r['item_deleted']??0)||!$live;
            $r['stars']=(int)$r['stars'];$r['rating']=(int)$r['stars'];$r['review_source']='marketplace';
            $r['item_id']=(int)$r['listing_id'];$r['item_type']=$r['live_type']??($r['listing_type']??'listing');$r['item_title']=$r['live_title']??($r['listing_title_snapshot']??'Listing');
            $r['item_public_id']=$r['live_public_id']??($r['listing_public_id_snapshot']??$r['listing_id']);$r['item_exists']=$live&&!$deleted;$r['item_deleted']=$deleted;$r['reviewer_id']=$authorId;
        }elseif($src==='place_written' || $src==='group_written'){
            $kind=$src==='place_written'?'place':'group';$key=$kind.'_id';
            $r['rating']=(int)$r['stars'];$r['comment']=$r['text']??'';$r['review_source']='community';$r['item_type']=$kind==='place'?'places':'groups';
            $r['item_id']=(int)$r[$key];$r['item_title']=$r['item_name'];$r['item_href']='/marketplace/item/'.$kind.'_'.(int)$r[$key];$r['item_exists']=true;$r['reviewer_id']=$authorId;
        }elseif($src==='resource_written'){
            $r['stars']=(int)$r['rating'];$r['review_source']='resources';$r['item_type']='resources';$r['item_id']=(int)$r['entity_id'];
            $r['item_title']=$r['item_name'];$r['item_href']='/recommend?category='.rawurlencode((string)$r['item_category']);$r['item_exists']=true;$r['reviewer_id']=$authorId;
        }
        $r['reviewer_name']=$author['display_name']??($author['username']??'User');$r['reviewer_public_id']=$author['public_id']??null;
        // Public activity responses should not expose internal join/helper columns.
        if($activity)foreach(['target_name','target_username','target_public_id','item_category','item_name','live_id','live_public_id','live_title','live_type'] as $helper)unset($r[$helper]);
        $rows[]=$r;
    }
    $receivedSt=$pdo->prepare('SELECT COUNT(*) FROM reviews WHERE user_id=?');$receivedSt->execute([$uid]);$received=(int)$receivedSt->fetchColumn();
    $receivedSt=$pdo->prepare('SELECT COUNT(*) FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.owner_user_id=?');$receivedSt->execute([$uid]);$received+=(int)$receivedSt->fetchColumn();
    $avgSt=$pdo->prepare('SELECT COALESCE(SUM(rating),0) FROM reviews WHERE user_id=?');$avgSt->execute([$uid]);$sum=(float)$avgSt->fetchColumn();
    $avgSt=$pdo->prepare('SELECT COALESCE(SUM(mr.stars),0) FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.owner_user_id=?');$avgSt->execute([$uid]);$sum+=(float)$avgSt->fetchColumn();
    response_json(['reviews'=>$rows,'items'=>$rows,'includes_item_reviews'=>true,'pagination'=>afu_pagination($page,$limit,$total),'summary'=>['reviews_count'=>$received,'avg_rating'=>$received>0?$sum/$received:0,'activity_count'=>$total]]);
}
if ((preg_match('#^/users/([^/]+)/reviews$#',$path,$mm)||preg_match('#^/reviews/user/([^/]+)$#',$path,$mm)) && $meth==='POST') {
    $me=current_user_id(true);$target=user_lookup(rawurldecode($mm[1]));if(!$target)fail('User not found',404);$rating=max(1,min(5,(int)input('rating',input('stars',5))));$comment=clean_string(input('comment',input('text','')));
    $st=$pdo->prepare('SELECT id FROM reviews WHERE user_id=? AND author_id=? LIMIT 1');$st->execute([(int)$target['id'],$me]);$rid=$st->fetchColumn();
    if($rid){$pdo->prepare('UPDATE reviews SET rating=?,comment=?,created_at=? WHERE id=?')->execute([$rating,$comment,now_sql(),$rid]);response_json(['ok'=>true,'id'=>(int)$rid]);}
    $pdo->prepare('INSERT INTO reviews (user_id,author_id,rating,comment,created_at) VALUES (?,?,?,?,?)')->execute([$target['id'],$me,$rating,$comment,now_sql()]);response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);
}
// Stage 5: one inexpensive public profile summary used by all profile counters.
// Written reviews contribute to activity, but never to the recipient's star score.
// The same approved-content predicates are used by /users/:id/reviews?scope=all.
function afu_profile_activity_stats(PDO $pdo, int $uid, ?int $viewer): array {
    $q=$pdo->prepare('SELECT COUNT(*) AS c,COALESCE(SUM(rating),0) AS s FROM reviews WHERE user_id=?');
    $q->execute([$uid]);$profile=$q->fetch()?:[];
    $q=$pdo->prepare('SELECT COUNT(*) AS c,COALESCE(SUM(mr.stars),0) AS s FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.owner_user_id=?');
    $q->execute([$uid]);$market=$q->fetch()?:[];
    $received=(int)($profile['c']??0)+(int)($market['c']??0);
    $sum=(float)($profile['s']??0)+(float)($market['s']??0);
    $avg=$received>0?$sum/$received:0.0;
    $sql="SELECT COUNT(*) FROM (".implode(' UNION ALL ',[
        'SELECT id FROM reviews WHERE user_id=?',
        'SELECT mr.id FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.owner_user_id=?',
        'SELECT id FROM reviews WHERE author_id=? AND user_id<>?',
        "SELECT mr.id FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.user_id=? AND (mr.owner_user_id IS NULL OR mr.owner_user_id<>?) AND LOWER(COALESCE(NULLIF(ml.status,''),'approved')) IN ('approved','active','published')",
        "SELECT r.id FROM place_reviews r JOIN community_places p ON p.id=r.place_id WHERE r.user_id=? AND LOWER(COALESCE(NULLIF(p.status,''),'approved')) IN ('approved','active','published')",
        "SELECT r.id FROM group_reviews r JOIN community_groups g ON g.id=r.group_id WHERE r.user_id=? AND LOWER(COALESCE(NULLIF(g.status,''),'approved')) IN ('approved','active','published')",
        "SELECT r.entity_id FROM resource_reviews r JOIN resource_entities e ON e.id=r.entity_id WHERE r.user_id=? AND LOWER(COALESCE(e.status,'pending')) IN ('approved','active','published')",
    ]).') profile_activity';
    $q=$pdo->prepare($sql);$q->execute([$uid,$uid,$uid,$uid,$uid,$uid,$uid,$uid,$uid]);$activity=(int)$q->fetchColumn();
    $q=$pdo->prepare('SELECT COUNT(*) FROM posts WHERE user_id=?');$q->execute([$uid]);$posts=(int)$q->fetchColumn();
    $result=[
        'ok'=>true,'posts_count'=>$posts,'activity_count'=>$activity,
        'reviews_count'=>$received,'received_count'=>$received,
        'written_count'=>max(0,$activity-$received),
        'avg_rating'=>$avg,'average'=>$avg,'count'=>$received,
    ];
    // Resumes are strictly private: never expose CV counts on another user's profile.
    if($viewer!==null && $viewer===$uid){
        $q=$pdo->prepare('SELECT COUNT(*) FROM cvs WHERE user_id=?');$q->execute([$uid]);$result['cvs_count']=(int)$q->fetchColumn();
    }
    return $result;
}
if (preg_match('#^/(?:users|user)/([^/]+)/activity-stats$#',$path,$mm) && $meth==='GET') {
    $target=user_lookup(rawurldecode($mm[1]));if(!$target)fail('User not found',404);
    response_json(afu_profile_activity_stats($pdo,(int)$target['id'],current_user_id(false)));
}
if (preg_match('#^/(?:users|user)/([^/]+)/ratings-stats$#',$path,$mm) && $meth==='GET') {
    $target=user_lookup(rawurldecode($mm[1]));if(!$target)fail('User not found',404);
    // Legacy route stays lightweight: only received ratings, no activity union.
    $uid=(int)$target['id'];
    $a=$pdo->prepare('SELECT COUNT(*) c,COALESCE(SUM(rating),0) s FROM reviews WHERE user_id=?');$a->execute([$uid]);$r1=$a->fetch()?:[];
    $b=$pdo->prepare('SELECT COUNT(*) c,COALESCE(SUM(mr.stars),0) s FROM marketplace_reviews mr JOIN marketplace_listings ml ON ml.id=mr.listing_id WHERE mr.owner_user_id=?');$b->execute([$uid]);$r2=$b->fetch()?:[];
    $received=(int)($r1['c']??0)+(int)($r2['c']??0);
    $sum=(float)($r1['s']??0)+(float)($r2['s']??0);
    $avg=$received>0?$sum/$received:0.0;
    response_json(['count'=>$received,'reviews_count'=>$received,'received_count'=>$received,'average'=>$avg,'avg_rating'=>$avg]);
}


// ---------- my review requests ----------
if ($path==='/me/requests' && $meth==='GET') {
    $me=current_user_id(true);$items=[];
    [$page,$limit,$offset]=afu_page();
    $filter=trim(strtolower((string)($_GET['status']??'all')));
    if($filter==='needs_changes')$filter='rejected';
    if(!in_array($filter,['all','pending','approved','rejected'],true))$filter='all';
    $suggestionFilter=(($_GET['include_suggestions']??'1')==='0')?' AND 1=0':'';
    $union="SELECT 'marketplace' kind,id row_id,COALESCE(status,'approved') status,COALESCE(updated_at,created_at,'') sort_at FROM marketplace_listings WHERE (user_id=? OR created_by=?)
      UNION ALL SELECT 'places',id,COALESCE(status,'approved'),COALESCE(updated_at,created_at,'') FROM community_places WHERE created_by=?
      UNION ALL SELECT 'groups',id,COALESCE(status,'approved'),COALESCE(updated_at,created_at,'') FROM community_groups WHERE created_by=?
      UNION ALL SELECT 'changes',id,COALESCE(status,'pending'),COALESCE(reviewed_at,created_at,'') FROM marketplace_listing_changes WHERE user_id=?
      UNION ALL SELECT 'suggestions',id,COALESCE(status,'pending'),COALESCE(reviewed_at,created_at,'') FROM entity_update_suggestions WHERE submitter_id=?$suggestionFilter";
    $unionParams=[$me,$me,$me,$me,$me,$me];
    $cs=$pdo->prepare("SELECT status,COUNT(*) c FROM ($union) r GROUP BY status");$cs->execute($unionParams);
    $counts=['all'=>0,'pending'=>0,'rejected'=>0,'approved'=>0];
    foreach($cs->fetchAll() as $c){$n=(int)$c['c'];$counts['all']+=$n;if(isset($counts[$c['status']]))$counts[$c['status']]+=$n;}
    $counts['needs_changes']=$counts['rejected'];
    $where=$filter==='all'?'':' WHERE status=?';$params=$unionParams;if($filter!=='all')$params[]=$filter;
    $st=$pdo->prepare("SELECT kind,row_id FROM ($union) r$where ORDER BY sort_at DESC,kind ASC,row_id DESC LIMIT $limit OFFSET $offset");$st->execute($params);
    $ids=['marketplace'=>[],'places'=>[],'groups'=>[],'changes'=>[],'suggestions'=>[]];
    foreach($st->fetchAll() as $it)$ids[$it['kind']][]=(int)$it['row_id'];
    $idSet=fn(string $kind):string => $ids[$kind]?implode(',',array_map('intval',$ids[$kind])):'0';

    $push=function(array $row) use (&$items){$items[]=$row;};
    $st=$pdo->prepare('SELECT * FROM marketplace_listings WHERE (user_id=? OR created_by=?) AND id IN ('.$idSet('marketplace').') ORDER BY id DESC');$st->execute([$me,$me]);
    foreach($st->fetchAll() as $r){$x=listing_row($r);$id=(int)$r['id'];$status=strtolower((string)($r['status']??'approved'));$push(['request_type'=>'listing','source_type'=>'marketplace','id'=>(string)$id,'entity_id'=>(string)$id,'title'=>$r['title']??('Listing #'.$id),'status'=>$status,'admin_reason'=>$r['admin_reason']??null,'created_at'=>$r['created_at']??null,'updated_at'=>$r['updated_at']??null,'reviewed_at'=>$r['reviewed_at']??null,'images'=>$x['images']??[],'item'=>$x,'details'=>$r,'public_link'=>'/marketplace/item/listing_'.$id,'editable'=>true,'resubmittable'=>in_array($status,['rejected','pending'],true)]);}
    $st=$pdo->prepare('SELECT * FROM community_places WHERE created_by=? AND id IN ('.$idSet('places').') ORDER BY id DESC');$st->execute([$me]);foreach($st->fetchAll() as $r){$id=(int)$r['id'];$status=strtolower((string)($r['status']??'approved'));$x=place_row($r);$push(['request_type'=>'listing','source_type'=>'places','id'=>'place_'.$id,'entity_id'=>(string)$id,'title'=>$r['name']??('Place #'.$id),'status'=>$status,'admin_reason'=>$r['admin_reason']??null,'created_at'=>$r['created_at']??null,'updated_at'=>$r['updated_at']??null,'reviewed_at'=>$r['reviewed_at']??null,'images'=>$x['images']??[],'item'=>$x,'details'=>$r,'public_link'=>'/marketplace/item/place_'.$id,'editable'=>true,'resubmittable'=>in_array($status,['rejected','pending'],true)]);}
    $st=$pdo->prepare('SELECT * FROM community_groups WHERE created_by=? AND id IN ('.$idSet('groups').') ORDER BY id DESC');$st->execute([$me]);foreach($st->fetchAll() as $r){$id=(int)$r['id'];$status=strtolower((string)($r['status']??'approved'));$push(['request_type'=>'listing','source_type'=>'groups','id'=>'group_'.$id,'entity_id'=>(string)$id,'title'=>$r['name']??('Group #'.$id),'status'=>$status,'admin_reason'=>$r['admin_reason']??null,'created_at'=>$r['created_at']??null,'updated_at'=>$r['updated_at']??null,'reviewed_at'=>$r['reviewed_at']??null,'images'=>[],'item'=>moderation_preview_item('groups',$r,[]),'details'=>$r,'public_link'=>'/marketplace/item/group_'.$id,'editable'=>true,'resubmittable'=>in_array($status,['rejected','pending'],true)]);}
    $st=$pdo->prepare('SELECT * FROM marketplace_listing_changes WHERE user_id=? AND id IN ('.$idSet('changes').') ORDER BY CASE WHEN status=\'pending\' THEN 0 WHEN status=\'rejected\' THEN 1 WHEN status=\'approved\' THEN 2 WHEN status=\'superseded\' THEN 3 ELSE 4 END, COALESCE(reviewed_at,created_at) DESC, id DESC');$st->execute([$me]);foreach($st->fetchAll() as $c){$source=strtolower((string)($c['source_type']??'marketplace'));$lid=(int)$c['listing_id'];$title='Listing #'.$lid;$link='/marketplace/item/listing_'.$lid;$base=null;if($source==='places'){$q=$pdo->prepare('SELECT * FROM community_places WHERE id=?');$q->execute([$lid]);$base=$q->fetch();$title=(string)(($base['name']??'')?:('Place #'.$lid));$link='/marketplace/item/place_'.$lid;}elseif($source==='groups'){$q=$pdo->prepare('SELECT * FROM community_groups WHERE id=?');$q->execute([$lid]);$base=$q->fetch();$title=(string)(($base['name']??'')?:('Group #'.$lid));$link='/marketplace/item/group_'.$lid;}else{$q=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=?');$q->execute([$lid]);$base=$q->fetch();if($base){$title=(string)(($base['title']??'')?:$title);$link='/marketplace/item/listing_'.$lid;}}$payload=json_decode((string)($c['payload_json']??'{}'),true)?:[];$preview=$base?moderation_preview_item($source,$base,$payload):$payload;$push(['request_type'=>'change','source_type'=>$source,'id'=>'change_'.(int)$c['id'],'entity_id'=>(string)$c['id'],'listing_id'=>$lid,'title'=>$title,'status'=>strtolower((string)($c['status']??'pending')),'admin_reason'=>$c['admin_reason']??null,'created_at'=>$c['created_at']??null,'updated_at'=>$c['reviewed_at']??$c['created_at']??null,'reviewed_at'=>$c['reviewed_at']??null,'payload'=>$payload,'current_listing'=>$base,'item'=>$preview,'details'=>$preview,'images'=>$preview['images']??[],'public_link'=>$link,'editable'=>true,'resubmittable'=>strtolower((string)($c['status']??''))==='rejected']);}
    // Include place-information suggestions in the submitter's PRIVATE request list.
    // This query is scoped to the logged-in owner; non-approved content is never returned to other users.
    $st=$pdo->prepare('SELECT s.*,p.name AS place_name,p.city AS place_city,p.state AS place_state FROM entity_update_suggestions s LEFT JOIN community_places p ON p.id=s.entity_id AND s.entity_type=\'place\' WHERE s.submitter_id=? AND s.id IN ('.$idSet('suggestions').') ORDER BY s.id DESC');
    $st->execute([$me]);
    foreach($st->fetchAll() as $sug){
        $sid=(int)$sug['id'];$pid=(int)$sug['entity_id'];$images=json_array($sug['images_json']??'[]');afu_suggestion_decorate($pdo,$sug);$suggestionSource=['place'=>'places','group'=>'groups','listing'=>'marketplace'][strtolower((string)($sug['entity_type']??'place'))]??'places';
        $payload=['title'=>$sug['place_name']??('Place #'.$pid),'name'=>$sug['place_name']??('Place #'.$pid),'city'=>$sug['place_city']??'','state'=>$sug['place_state']??'','field_name'=>$sug['field_name'],'proposed_value'=>$sug['proposed_value']??'','details'=>$sug['details']??'','images'=>$images];
        $status=strtolower((string)($sug['status']??'pending'));
        $push(['request_type'=>'place_suggestion','source_type'=>$suggestionSource,'id'=>'suggestion_'.$sid,'entity_id'=>(string)$sid,'place_id'=>$pid,'title'=>(string)$payload['title'],'status'=>$status,'admin_reason'=>$sug['admin_reason']??null,'created_at'=>$sug['created_at']??null,'updated_at'=>$sug['reviewed_at']??$sug['created_at']??null,'reviewed_at'=>$sug['reviewed_at']??null,'field_name'=>$sug['field_name'],'proposed_value'=>$sug['proposed_value']??'','suggestion_details'=>$sug['details']??'','images'=>$images,'item'=>$payload,'details'=>$payload,'public_link'=>$sug['public_link'],'editable'=>in_array($status,['rejected','pending','withdrawn','revoked'],true),'resubmittable'=>in_array($status,['rejected','withdrawn','revoked'],true)]);
    }
    $hist=$pdo->prepare('SELECT * FROM moderation_events WHERE user_id=? AND entity_id IN ('.implode(',',array_merge($ids['marketplace'],$ids['places'],$ids['groups'],$ids['changes'],$ids['suggestions'])?:[0]).') ORDER BY id DESC');$hist->execute([$me]);$events=$hist->fetchAll();$by=[];foreach($events as $e){$k=strtolower((string)$e['entity_type']).':'.(string)$e['entity_id'];$by[$k][]=$e;}
    foreach($items as &$it){$etype=$it['request_type']==='change'?($it['source_type'].'_change'):$it['source_type'];if($etype==='marketplace')$etype='marketplace';$key=strtolower($etype).':'.(string)$it['entity_id'];$it['history']=$by[$key]??[];}unset($it);
    usort($items,fn($a,$b)=>strcmp((string)($b['updated_at']??$b['created_at']??''),(string)($a['updated_at']??$a['created_at']??'')));
    response_json(['requests'=>$items,'items'=>$items,'counts'=>$counts,'pagination'=>afu_pagination($page,$limit,$filter==='all'?$counts['all']:($counts[$filter]??0))]);
}


// Explicit re-submit of a previously rejected edit request. This updates the SAME request row
// so the user/admin never see the old rejected request while a hidden replacement is pending.
if (preg_match('#^/me/listing-changes/(\d+)/resubmit$#',$path,$mm) && in_array($meth,['PUT','PATCH','POST'],true)) {
    $me=current_user_id(true);$cid=(int)$mm[1];$d=input_all();
    $st=$pdo->prepare('SELECT * FROM marketplace_listing_changes WHERE id=? AND user_id=? LIMIT 1');$st->execute([$cid,$me]);$c=$st->fetch();
    if(!$c)fail('Change request not found',404);
    $previous=strtolower((string)($c['status']??'pending'));
    if(!in_array($previous,['rejected','pending'],true))fail('Only rejected or pending requests can be resubmitted',409);
    $source=strtolower(clean_string($c['source_type']??'marketplace'));if(!in_array($source,['marketplace','places','groups'],true))$source='marketplace';
    $payload=[];
    if($source==='marketplace'){
        $allowed=['type','title','city','state','link','contact','currency','price_type','price_value','platform','topic','notes','description','price','website','address','category','phone','whatsapp','email','car_year','car_mileage','bedrooms','bathrooms','job_type','status_label'];
        $aliases=['priceType'=>'price_type','priceValue'=>'price_value','carYear'=>'car_year','carMileage'=>'car_mileage','jobType'=>'job_type'];foreach($aliases as $src=>$dst){if(array_key_exists($src,$d)&&!array_key_exists($dst,$d))$d[$dst]=$d[$src];}
        foreach($allowed as $f){if(array_key_exists($f,$d))$payload[$f]=$d[$f];}
        $imgs=upload_many('images','marketplace');if(!$imgs&&isset($d['images'])&&is_array($d['images']))$imgs=$d['images'];$imgs=persist_media_images($imgs,'marketplace');if($imgs)$payload['images_json']=json_encode($imgs,JSON_UNESCAPED_SLASHES);
    }elseif($source==='places'){
        if(array_key_exists('title',$d)&&!array_key_exists('name',$d))$d['name']=$d['title'];
        foreach(['name','category','city','state','address','phone','website','notes'] as $f){if(array_key_exists($f,$d))$payload[$f]=$d[$f];}
        if(array_key_exists('images',$d)||array_key_exists('images_json',$d)||isset($_FILES['images'])){$imgs=upload_many('images','marketplace');if(!$imgs&&array_key_exists('images',$d))$imgs=json_array($d['images']);if(!$imgs&&array_key_exists('images_json',$d))$imgs=json_array($d['images_json']);$payload['images']=persist_media_images($imgs,'marketplace');}
    }else{
        if(array_key_exists('title',$d)&&!array_key_exists('name',$d))$d['name']=$d['title'];if(array_key_exists('website',$d)&&!array_key_exists('link',$d))$d['link']=$d['website'];
        foreach(['name','platform','link','city','state','topic','notes'] as $f){if(array_key_exists($f,$d))$payload[$f]=$d[$f];}
    }
    // Merge with the previous request so untouched fields/images are preserved.
    $oldPayload=json_decode((string)($c['payload_json']??'{}'),true);if(!is_array($oldPayload))$oldPayload=[];$payload=array_merge($oldPayload,$payload);
    $ts=now_sql();
    $pdo->prepare("UPDATE marketplace_listing_changes SET payload_json=?,status='pending',admin_reason=NULL,reviewed_by=NULL,reviewed_at=NULL,created_at=? WHERE id=? AND user_id=?")
        ->execute([json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),$ts,$cid,$me]);
    supersede_other_listing_changes($source,(int)$c['listing_id'],$me,$cid);
    $check=$pdo->prepare('SELECT * FROM marketplace_listing_changes WHERE id=? AND user_id=? LIMIT 1');$check->execute([$cid,$me]);$fresh=$check->fetch();
    if(!$fresh||strtolower((string)($fresh['status']??''))!=='pending')fail('Resubmit did not reach pending state',500);
    moderation_event($source.'_change',$cid,$me,'resubmitted',$previous,'pending','User corrected and resubmitted the rejected edit request.',null,['listing_id'=>(int)$c['listing_id']]);
    /* Inline confirmation; no self-notification. */
    response_json(['ok'=>true,'status'=>'pending','pending_review'=>true,'change_request_id'=>$cid,'queue_at'=>$ts,'request'=>$fresh,'message'=>'Resubmitted for admin review.']);
}

// ---------- admin ----------
if (str_starts_with($path,'/admin/')) {
    $admin=require_admin();
    if($path==='/admin/overview' && $meth==='GET'){
        $stats=[];foreach(['users'=>'users','posts'=>'posts','reports'=>'reports','verifications'=>'verification_requests','appeals'=>'appeals','suggestions'=>'entity_update_suggestions'] as $k=>$t){$stats[$k]=(int)$pdo->query("SELECT COUNT(*) FROM $t")->fetchColumn();}
        $stats['listings']=(int)$pdo->query("SELECT COUNT(*) FROM marketplace_listings")->fetchColumn()+(int)$pdo->query("SELECT COUNT(*) FROM community_places")->fetchColumn()+(int)$pdo->query("SELECT COUNT(*) FROM community_groups")->fetchColumn();
        response_json(['stats'=>$stats]);
    }
    if($path==='/admin/users' && $meth==='GET'){ $rows=$pdo->query('SELECT id FROM users ORDER BY id DESC')->fetchAll(PDO::FETCH_COLUMN);$users=array_map(fn($id)=>user_profile_row((int)$id),$rows);response_json(['users'=>$users]); }
    if($path==='/admin/posts' && $meth==='GET'){ $rows=$pdo->query('SELECT * FROM posts ORDER BY id DESC')->fetchAll();$rows=array_map(fn($r)=>post_row($r,$admin['id']),$rows);response_json(['posts'=>$rows]); }
    if($path==='/admin/listings' && $meth==='GET'){
        // Compute duplicate signals in memory; do NOT issue 2-4 extra SQL
        // COUNT queries for every single one of the 50-state directory cards.
        $keyFor = static function(array $item, array $fields): string {
            return json_encode(array_map(static fn($field)=>mb_strtolower(trim((string)($item[$field]??''))),$fields), JSON_UNESCAPED_UNICODE);
        };
        $countKeys = static function(array $items, array $fields) use ($keyFor): array {
            $counts=[];
            foreach($items as $item){$k=$keyFor($item,$fields);$counts[$k]=($counts[$k]??0)+1;}
            return $counts;
        };

        $rows=[];

        // Marketplace listings.
        $raw=$pdo->query('SELECT * FROM marketplace_listings ORDER BY id DESC')->fetchAll();
        $marketDup=$countKeys($raw,['title','type','city','state']);
        $marketContact=[];
        foreach(['link','phone','email'] as $f)$marketContact[$f]=$countKeys($raw,[$f]);
        foreach($raw as $rr){
            $x=listing_row($rr);$flags=[];
            $x['moderation_id']=(string)($rr['id']??'');
            $x['internal_id']=(int)($rr['id']??0);
            $x['submitted_at']=$rr['created_at']??null;
            $x['queue_at']=$rr['updated_at']??$rr['created_at']??null;
            $x['all_details']=$rr;
            $x['possible_duplicates']=max(0,($marketDup[$keyFor($rr,['title','type','city','state'])]??1)-1);
            if($x['possible_duplicates']>0)$flags[]='possible_duplicate';
            foreach(['link','phone','email'] as $contactField){$value=trim((string)($rr[$contactField]??''));if($value!==''){if(($marketContact[$contactField][$keyFor($rr,[$contactField])]??0)>1){$flags[]='reused_'.$contactField;}}}
            $reviewText=mb_strtolower(implode(' ',array_filter([(string)($rr['title']??''),(string)($rr['description']??''),(string)($rr['notes']??''),(string)($rr['contact']??'')])));
            foreach(['gift card','wire transfer','western union','crypto only','bitcoin only','zelle only','cash app only','deposit first','pay upfront','upfront fee','send money first','بطاقة هدايا','حوالة','ادفع مقدم','ادفع مقدماً'] as $term){if($term!=='' && str_contains($reviewText,mb_strtolower($term))){$flags[]='payment_language_review';break;}}
            $owner=$x['owner']??[];if(!$owner || !truthy($owner['is_verified']??0))$flags[]='unverified_owner';
            $link=trim((string)($rr['link']??''));if($link!=='' && !filter_var($link,FILTER_VALIDATE_URL))$flags[]='invalid_link_format';
            if(!public_place_has_required_fields($rr))$flags[]='missing_required_location_fields';
            $x['review_flags']=array_values(array_unique($flags));$rows[]=$x;
        }

        // Community places use the same admin moderation queue.
        $raw=$pdo->query('SELECT * FROM community_places ORDER BY id DESC')->fetchAll();
        $placeDup=$countKeys($raw,['name','category','city','state']);
        $placeContacts=[];
        foreach(['website','phone'] as $f)$placeContacts[$f]=$countKeys($raw,[$f]);
        foreach($raw as $rr){
            $numericId=(int)$rr['id'];$x=place_row($rr);$flags=[];
            $x['internal_id']=$numericId;$x['id']='place_'.$numericId;$x['public_id']=$x['id'];$x['moderation_id']=$x['id'];
            $x['title']=$rr['name']??'';$x['name']=$rr['name']??'';$x['type']='places';$x['link']=$rr['website']??'';$x['description']=$rr['notes']??'';$x['notes']=$rr['notes']??'';
            $x['user_id']=(int)($rr['created_by']??0);$x['created_by']=$x['user_id'];$x['owner']=$x['owner']??user_profile_row($x['user_id']);
            $x['status']=$rr['status']??'approved';$x['admin_reason']=$rr['admin_reason']??null;$x['submitted_at']=$rr['created_at']??null;$x['queue_at']=$rr['updated_at']??$rr['created_at']??null;$x['all_details']=$rr;
            $x['possible_duplicates']=max(0,($placeDup[$keyFor($rr,['name','category','city','state'])]??1)-1);if($x['possible_duplicates']>0)$flags[]='possible_duplicate';
            foreach([['website','reused_link'],['phone','reused_phone']] as [$field,$flag]){$value=trim((string)($rr[$field]??''));if($value!==''){if(($placeContacts[$field][$keyFor($rr,[$field])]??0)>1)$flags[]=$flag;}}
            $owner=$x['owner']??[];if(!$owner || !truthy($owner['is_verified']??0))$flags[]='unverified_owner';
            $link=trim((string)($rr['website']??''));if($link!=='' && !filter_var($link,FILTER_VALIDATE_URL))$flags[]='invalid_link_format';
            $x['review_flags']=array_values(array_unique($flags));$rows[]=$x;
        }

        // Community groups use the same admin moderation queue.
        $raw=$pdo->query('SELECT * FROM community_groups ORDER BY id DESC')->fetchAll();
        $groupDup=$countKeys($raw,['name','platform','city','state']);
        $groupLinks=$countKeys($raw,['link']);
        foreach($raw as $rr){
            $numericId=(int)$rr['id'];$flags=[];$ownerId=(int)($rr['created_by']??0);$owner=$ownerId?user_profile_row($ownerId):null;
            $x=$rr;$x['internal_id']=$numericId;$x['id']='group_'.$numericId;$x['public_id']=$x['id'];$x['moderation_id']=$x['id'];
            $x['title']=$rr['name']??'';$x['type']='groups';$x['description']=$rr['notes']??'';$x['user_id']=$ownerId;$x['owner']=$owner;$x['images']=[];$x['status']=$rr['status']??'approved';$x['admin_reason']=$rr['admin_reason']??null;$x['submitted_at']=$rr['created_at']??null;$x['queue_at']=$rr['updated_at']??$rr['created_at']??null;$x['all_details']=$rr;
            $x['possible_duplicates']=max(0,($groupDup[$keyFor($rr,['name','platform','city','state'])]??1)-1);if($x['possible_duplicates']>0)$flags[]='possible_duplicate';
            $value=trim((string)($rr['link']??''));if($value!=='' && ($groupLinks[$keyFor($rr,['link'])]??0)>1)$flags[]='reused_link';
            if(!$owner || !truthy($owner['is_verified']??0))$flags[]='unverified_owner';
            if($value!=='' && !filter_var($value,FILTER_VALIDATE_URL))$flags[]='invalid_link_format';
            $x['review_flags']=array_values(array_unique($flags));$rows[]=$x;
        }

        $hasModerationEvents=true;
        try{$pdo->query('SELECT 1 FROM moderation_events LIMIT 1');}catch(Throwable $e){$hasModerationEvents=false;}
        foreach($rows as &$mr){
            if(!$hasModerationEvents){$mr['moderation_history']=[];continue;}
            $etype='marketplace';$eid=(string)($mr['internal_id']??preg_replace('/\D+/','',(string)($mr['id']??'')));
            if(str_starts_with((string)($mr['id']??''),'place_'))$etype='places';
            elseif(str_starts_with((string)($mr['id']??''),'group_'))$etype='groups';
            try{$hq=$pdo->prepare('SELECT * FROM moderation_events WHERE entity_type=? AND entity_id=? ORDER BY id DESC LIMIT 10');$hq->execute([$etype,$eid]);$mr['moderation_history']=$hq->fetchAll();}catch(Throwable $e){$mr['moderation_history']=[];}
        }unset($mr);

        usort($rows,function($a,$b){
            $rank=['pending'=>0,'rejected'=>1,'approved'=>2,'active'=>2,'published'=>2];
            $sa=$rank[strtolower((string)($a['status']??'approved'))]??3;$sb=$rank[strtolower((string)($b['status']??'approved'))]??3;
            if($sa!==$sb)return $sa<=>$sb;
            return strcmp((string)($b['queue_at']??$b['updated_at']??$b['created_at']??''),(string)($a['queue_at']??$a['updated_at']??$a['created_at']??''));
        });
        response_json(['listings'=>$rows]);
    }

    if($path==='/admin/listing-changes' && $meth==='GET'){
        $changes=$pdo->query("SELECT c.*,u.username FROM marketplace_listing_changes c LEFT JOIN users u ON u.id=c.user_id ORDER BY CASE WHEN c.status='pending' THEN 0 WHEN c.status='rejected' THEN 1 WHEN c.status='approved' THEN 2 WHEN c.status='superseded' THEN 3 ELSE 4 END, COALESCE(c.reviewed_at,c.created_at) DESC, c.id DESC")->fetchAll();
        foreach($changes as &$r){
            $source=strtolower(trim((string)($r['source_type']??'marketplace')));if($source==='')$source='marketplace';
            $listing=null;
            if($source==='places'){$q=$pdo->prepare('SELECT * FROM community_places WHERE id=?');$q->execute([(int)$r['listing_id']]);$listing=$q->fetch();$r['listing_title']=$listing['name']??null;$r['listing_type']='places';}
            elseif($source==='groups'){$q=$pdo->prepare('SELECT * FROM community_groups WHERE id=?');$q->execute([(int)$r['listing_id']]);$listing=$q->fetch();$r['listing_title']=$listing['name']??null;$r['listing_type']='groups';}
            else{$q=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=?');$q->execute([(int)$r['listing_id']]);$listing=$q->fetch();$r['listing_title']=$listing['title']??null;$r['listing_type']=$listing['type']??'listing';}
            $r['source_type']=$source;$r['listing_city']=$listing['city']??'';$r['listing_state']=$listing['state']??'';$r['submitted_at']=$r['created_at']??null;$r['queue_at']=$r['created_at']??null;$r['current_listing']=$listing?:null;
            $r['listing_public_id']=$source==='places'?'place_'.$r['listing_id']:($source==='groups'?'group_'.$r['listing_id']:($listing['public_id']??$r['listing_id']));
            $r['payload']=json_decode((string)$r['payload_json'],true)?:[];
            $r['preview_item']=$listing?moderation_preview_item($source,$listing,$r['payload']):$r['payload'];
            $imgs=[];
            if(isset($r['payload']['images']))$imgs=json_array($r['payload']['images']);
            elseif(isset($r['payload']['images_json']))$imgs=json_array($r['payload']['images_json']);
            $r['preview_images']=$imgs;
        }
        unset($r);
        response_json(['changes'=>$changes]);
    }

    // Review moderation: admin-only, read all review kinds without changing data.
    if($path==='/admin/reviews' && $meth==='GET'){
        $reviews=[];
        foreach([['marketplace','marketplace_reviews','listing_id','comment'],['places','place_reviews','place_id','text'],['groups','group_reviews','group_id','text']] as $meta){
            [$kind,$table,$foreign,$textField]=$meta;
            $rows=$kind==='marketplace'
                ? $pdo->query("SELECT r.id,r.user_id,r.listing_id,r.stars,r.comment,r.created_at,r.listing_title_snapshot,CASE WHEN l.id IS NULL THEN 1 ELSE 0 END AS is_orphan FROM marketplace_reviews r LEFT JOIN marketplace_listings l ON l.id=r.listing_id ORDER BY r.id DESC LIMIT 500")->fetchAll()
                : $pdo->query("SELECT id,user_id,$foreign AS listing_id,stars,$textField AS comment,created_at FROM $table ORDER BY id DESC LIMIT 500")->fetchAll();
            foreach($rows as $row){$row['kind']=$kind;$reviews[]=$row;}
        }
        usort($reviews,static fn($a,$b)=>strcmp((string)($b['created_at']??''),(string)($a['created_at']??'')));
        response_json(['reviews'=>$reviews]);
    }
    // Exact-one review cleanup, only for already-deleted QA listings/comments
    // marked TEST-KIKO. The reviewer, rating, and content must remain unchanged
    // until the conditional delete succeeds. Never touch a live listing's review.
    if($path==='/admin/reviews/cleanup-test-kiko' && $meth==='POST'){
        // Exact QA marker, orphan only; never remove a real listing's review.
        $sql="SELECT r.id,r.listing_id,r.stars,r.comment FROM marketplace_reviews r
              LEFT JOIN marketplace_listings l ON l.id=r.listing_id
              WHERE l.id IS NULL AND r.listing_id=2 AND r.stars=5 AND r.comment='TEST-KIKO test review only - please ignore. Functionality test review.'";
        $matches=$pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        if(count($matches)!==1) {
            if(!$matches) response_json(['ok'=>true,'removed'=>0,'message'=>'Orphan QA review not found']);
            fail('Multiple matching QA reviews; no rows deleted',409,['matches'=>count($matches)]);
        }
        $row=$matches[0];
        $delete=$pdo->prepare("DELETE FROM marketplace_reviews WHERE id=? AND listing_id=? AND stars=5
             AND comment='TEST-KIKO test review only - please ignore. Functionality test review.'
             AND NOT EXISTS (SELECT 1 FROM marketplace_listings l WHERE l.id=marketplace_reviews.listing_id)");
        $delete->execute([(int)$row['id'],(int)$row['listing_id']]);
        if($delete->rowCount()!==1)fail('QA review changed during cleanup; nothing else deleted',409);
        response_json(['ok'=>true,'removed'=>1,'deleted_id'=>(int)$row['id']]);
    }
    // Database-level protection for every future delete path. Requires explicit
    // admin action after taking a verified LIVE database backup; never automatic.
    if($path==='/admin/reviews/cascade-status' && $meth==='GET'){
        $st=$pdo->query('SELECT COUNT(*) FROM marketplace_reviews r LEFT JOIN marketplace_listings l ON l.id=r.listing_id WHERE l.id IS NULL');
        $orphans=(int)$st->fetchColumn();
        if(is_sqlite())response_json(['enabled'=>false,'supported'=>false,'orphan_count'=>$orphans]);
        $q=$pdo->prepare("SELECT DELETE_RULE FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='marketplace_reviews' AND REFERENCED_TABLE_NAME='marketplace_listings' LIMIT 1");
        $q->execute();$rule=(string)($q->fetchColumn()?:'');
        response_json(['enabled'=>strtoupper($rule)==='CASCADE','supported'=>true,'orphan_count'=>$orphans,'delete_rule'=>$rule]);
    }
    if($path==='/admin/reviews/enable-cascade' && $meth==='POST'){
        if(is_sqlite())fail('MySQL-only operation',409);
        if((string)input('confirm','')!=='BACKUP_VERIFIED')fail('Confirm a verified backup first',422);
        $orphans=(int)$pdo->query('SELECT COUNT(*) FROM marketplace_reviews r LEFT JOIN marketplace_listings l ON l.id=r.listing_id WHERE l.id IS NULL')->fetchColumn();
        if($orphans!==0)fail('Resolve orphan reviews first; no rows were changed',409,['orphan_count'=>$orphans]);
        $q=$pdo->prepare("SELECT DELETE_RULE FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='marketplace_reviews' AND REFERENCED_TABLE_NAME='marketplace_listings' LIMIT 1");
        $q->execute();$rule=(string)($q->fetchColumn()?:'');
        if($rule!==''){
            if(strtoupper($rule)!=='CASCADE')fail('A non-cascade foreign key already exists; manual database review required',409);
            response_json(['ok'=>true,'enabled'=>true,'already_enabled'=>true]);
        }
        try {
            $pdo->exec('ALTER TABLE `marketplace_reviews` ADD CONSTRAINT `fk_marketplace_reviews_listing_id` FOREIGN KEY (`listing_id`) REFERENCES `marketplace_listings` (`id`) ON DELETE CASCADE');
        } catch(Throwable $e) {
            error_log('AnswerForU cascade migration failed: '.$e->getMessage());
            fail('Could not enable review cascade; check database permissions and foreign-key compatibility',503);
        }
        $q->execute();$rule=(string)($q->fetchColumn()?:'');
        if(strtoupper($rule)!=='CASCADE')fail('Foreign key verification failed',503);
        response_json(['ok'=>true,'enabled'=>true,'orphan_count'=>0]);
    }
    if(preg_match('#^/admin/reviews/(marketplace|places|groups)/(\d+)$#',$path,$mm) && $meth==='DELETE'){
        $table=['marketplace'=>'marketplace_reviews','places'=>'place_reviews','groups'=>'group_reviews'][$mm[1]];
        $delete=$pdo->prepare("DELETE FROM $table WHERE id=?");$delete->execute([(int)$mm[2]]);
        if($delete->rowCount()!==1)fail('Review not found',404);
        response_json(['ok'=>true,'deleted_id'=>(int)$mm[2]]);
    }
    if($path==='/admin/reports' && $meth==='GET'){response_json(['reports'=>$pdo->query('SELECT * FROM reports ORDER BY id DESC')->fetchAll()]);}
    if($path==='/admin/appeals' && $meth==='GET'){response_json(['appeals'=>$pdo->query('SELECT * FROM appeals ORDER BY id DESC')->fetchAll()]);}
    if($path==='/admin/verifications' && $meth==='GET'){response_json(['requests'=>array_map('afu_signed_verification_row',$pdo->query('SELECT * FROM verification_requests ORDER BY id DESC')->fetchAll())]);}
    if($path==='/admin/content/all' && $meth==='GET'){ $st=$pdo->prepare("SELECT content_json,updated_at FROM site_content WHERE id='main_data' LIMIT 1");$st->execute();$r=$st->fetch();response_json($r?['exists'=>true,'data'=>json_decode($r['content_json']?:'{}',true),'updated_at'=>$r['updated_at']]:['exists'=>false,'data'=>null]); }
    if($path==='/admin/content/all' && in_array($meth,['PUT','PATCH','POST'],true)){ $data=input('data',null);if(!is_array($data)||array_is_list($data))fail('Valid data payload required');$j=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);$pdo->prepare("DELETE FROM site_content WHERE id='main_data'")->execute();$pdo->prepare('INSERT INTO site_content (id,content_json,updated_at) VALUES (?,?,?)')->execute(['main_data',$j,now_sql()]);response_json(['ok'=>true,'message'=>'Content updated successfully']); }
    if($path==='/admin/content/roadmap-v2' && $meth==='GET'){ $st=$pdo->prepare("SELECT content_json,updated_at FROM site_content WHERE id='roadmap_v2' LIMIT 1");$st->execute();$r=$st->fetch();response_json($r?['exists'=>true,'data'=>json_decode($r['content_json']?:'{}',true),'updated_at'=>$r['updated_at']]:['exists'=>false,'data'=>null]); }
    if($path==='/admin/content/roadmap-v2' && in_array($meth,['PUT','PATCH','POST'],true)){ $data=input('data',input_all());if(!is_array($data))fail('Valid data payload required');$j=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);$pdo->prepare("DELETE FROM site_content WHERE id='roadmap_v2'")->execute();$pdo->prepare('INSERT INTO site_content (id,content_json,updated_at) VALUES (?,?,?)')->execute(['roadmap_v2',$j,now_sql()]);response_json(['ok'=>true]); }

    // One-time cleanup for a QA-only entry accidentally published in production.
    // Explicit admin POST only, backup document, exact identifier and title match.
    if($path==='/admin/content/learn/cleanup-qa' && $meth==='POST'){
        $pdo->beginTransaction();
        try {
            $st=$pdo->prepare('SELECT content_json FROM site_content WHERE id=?'.(is_sqlite()?'':' FOR UPDATE'));
            $st->execute(['learn_america_v1']);$original=$st->fetchColumn();
            if($original===false){$pdo->rollBack();fail('Learning content missing',404);}
            $doc=json_decode((string)$original,true);
            if(!is_array($doc) || !is_array($doc['currency_items']??null)){$pdo->rollBack();fail('Invalid learning document',422);}
            $found=false;$next=[];
            foreach($doc['currency_items'] as $item){
                $label=(string)($item['title']['ar']??$item['name']['ar']??$item['title']??$item['name']??'');
                if((string)($item['id']??'')==='new_1792709673614' && str_contains($label,'اختبار QA')){$found=true;continue;}
                $next[]=$item;
            }
            if($found){
                $backupId='learn_america_qa_backup_20261022';
                $st=$pdo->prepare('SELECT id FROM site_content WHERE id=?');$st->execute([$backupId]);
                if(!$st->fetchColumn()){$pdo->prepare('INSERT INTO site_content (id,content_json,updated_at) VALUES (?,?,?)')->execute([$backupId,$original,now_sql()]);}
                $doc['currency_items']=$next;
                $encoded=json_encode($doc,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
                $pdo->prepare('UPDATE site_content SET content_json=?,updated_at=? WHERE id=?')->execute([$encoded,now_sql(),'learn_america_v1']);
            }
            $pdo->commit();response_json(['ok'=>true,'removed'=>$found]);
        }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();throw $e;}
    }
    if($path==='/admin/content/learn' && $meth==='GET'){ response_json(content_admin_read('learn_america_v1')); }
    if($path==='/admin/content/learn' && in_array($meth,['PUT','PATCH','POST'],true)){
        $body=input_all();$data=$body['data']??$body;
        if(!is_array($data)||array_is_list($data))fail('Valid Learn America data payload required');
        $sections=['currency_items','road_signs','road_sign_groups','conversions','quiz_bank','store_groups','store_topic_chips','service_places','education_cards','life_guides'];
        foreach($sections as $key){if(!isset($data[$key])||!is_array($data[$key])||!array_is_list($data[$key]))fail('Missing or invalid Learn America section: '.$key);}
        if(!is_array($data['nova_info']??null))fail('Missing Learn America nova_info');
        $encoded=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_INVALID_UTF8_SUBSTITUTE);
        if($encoded===false||strlen($encoded)>3000000)fail('Invalid or oversized learning content',413);
        // Optimistic concurrency: prevent a stale admin tab from silently replacing another save.
        $expected=is_string($body['expected_revision']??null)?$body['expected_revision']:null;
        $pdo->beginTransaction();
        try {
            $q=$pdo->prepare('SELECT content_json FROM site_content WHERE id=?');$q->execute(['learn_america_v1']);$original=$q->fetchColumn();
            $revision=$original===false?null:hash('sha256',(string)$original);
            if($expected!==null && !hash_equals($revision??'', $expected)) { $pdo->rollBack();fail('Learn America changed in another session. Reload before saving.',409); }
            if($original===false){$pdo->prepare('INSERT INTO site_content (id,content_json,updated_at) VALUES (?,?,?)')->execute(['learn_america_v1',$encoded,now_sql()]);}
            else{$pdo->prepare('UPDATE site_content SET content_json=?,updated_at=? WHERE id=?')->execute([$encoded,now_sql(),'learn_america_v1']);}
            $pdo->commit();
        }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();throw $e;}
        response_json(['ok'=>true,'revision'=>hash('sha256',$encoded),'message'=>'Learn America saved to canonical database']);
    }
    if($path==='/admin/glossary' && $meth==='POST'){ $d=input_all();$pdo->prepare('INSERT INTO glossary_terms (slug,term,category,definition_ar,definition_en,definition_es,example_ar,example_en,example_es,aliases_json,source_url,status,submitted_by,submission_note,is_featured,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([glossary_safe_slug($pdo,$d),clean_string($d['term']??''),clean_string($d['category']??'general'),clean_string($d['definition_ar']??''),clean_string($d['definition_en']??''),clean_string($d['definition_es']??''),clean_string($d['example_ar']??''),clean_string($d['example_en']??''),clean_string($d['example_es']??''),json_encode($d['aliases']??[]),clean_string($d['source_url']??''),clean_string($d['status']??'approved'),$admin['id'],clean_string($d['submission_note']??''),truthy($d['is_featured']??0)?1:0,now_sql(),now_sql()]);$newId=(int)$pdo->lastInsertId();$q=$pdo->prepare('UPDATE glossary_terms SET pron_ar=?,basics_group=? WHERE id=?');$q->execute([clean_string($d['pron_ar']??''),clean_string($d['basics_group']??''),$newId]);response_json(['ok'=>true,'id'=>$newId],201); }
    if($path==='/admin/glossary' && $meth==='GET'){
        $filter=strtolower(clean_string($_GET['status']??''));
        if($filter!=='' && !in_array($filter,['pending','approved','rejected'],true))fail('Unknown glossary status',400);
        if($filter===''){$rows=$pdo->query('SELECT * FROM glossary_terms ORDER BY id DESC')->fetchAll();}
        else {$q=$pdo->prepare('SELECT * FROM glossary_terms WHERE status=? ORDER BY id DESC');$q->execute([$filter]);$rows=$q->fetchAll();}
        $items=array_map('glossary_row',$rows);
        response_json(['terms'=>$items,'items'=>$items,'data'=>$items,'total'=>count($items)]);
    }
    if($path==='/admin/resources' && $meth==='POST'){
        $d=input_all();$name=clean_string($d['name']??'');$category=clean_string($d['category']??'');
        if($name==='' || $category==='')fail('Resource name and category are required',422);
        $slug=clean_string($d['slug']??'');
        if($slug==='')$slug='admin-'.substr(hash('sha256',mb_strtolower($category.'|'.$name)),0,20);
        $tags=$d['tags_json']??($d['tags']??[]);
        if(is_array($tags))$tags=json_encode($tags,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
        if(!is_string($tags)||json_decode($tags,true)===null)$tags='[]';
        $pdo->prepare('INSERT INTO resource_entities (category,slug,name,description,website_url,referral_url,logo_url,state_code,coverage_label,tags_json,status,submitted_by,submission_note,is_featured,is_official,verified_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([
            $category,$slug,$name,clean_string($d['description']??''),clean_string($d['website_url']??''),clean_string($d['referral_url']??''),clean_string($d['logo_url']??''),clean_string($d['state_code']??'ALL'),clean_string($d['coverage_label']??''),$tags,clean_string($d['status']??'approved'),$admin['id'],clean_string($d['submission_note']??''),truthy($d['is_featured']??0)?1:0,truthy($d['is_official']??0)?1:0,clean_string($d['verified_at']??'')?:null,now_sql(),now_sql()]);
        response_json(['ok'=>true,'id'=>(int)$pdo->lastInsertId()],201);
    }
    if($path==='/admin/resources' && $meth==='GET'){
        // Always share the same resource_entities table with public /api/resources.
        // Older frontend versions expect items; resources is retained for compatibility.
        $filter=strtolower(clean_string($_GET['status']??''));
        if($filter!=='' && !in_array($filter,['pending','approved','rejected'],true))fail('Unknown resource status',400);
        $params=[];$where='';
        if($filter!==''){$where=' WHERE status=?';$params[]=$filter;}
        $query=$pdo->prepare('SELECT * FROM resource_entities'.$where." ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, id DESC");
        $query->execute($params);$rows=$query->fetchAll();
        $counts=['pending'=>0,'approved'=>0,'rejected'=>0];
        foreach($pdo->query('SELECT status,COUNT(*) n FROM resource_entities GROUP BY status')->fetchAll() as $c){$k=(string)$c['status'];if(isset($counts[$k]))$counts[$k]=(int)$c['n'];}
        response_json(['resources'=>$rows,'items'=>$rows,'data'=>$rows,'total'=>count($rows),'counts'=>$counts]);
    }
    if(preg_match('#^/admin/users/([^/]+)/(verify|ban|role|password)$#',$path,$mm) && in_array($meth,['PATCH','PUT','POST'],true)){
        $uid=(int)$mm[1];$action=$mm[2];
        if($action==='verify'){$v=truthy(input('is_verified',true))?1:0;$pdo->prepare('UPDATE users SET is_verified=? WHERE id=?')->execute([$v,$uid]);ensure_user_profile($uid);$pdo->prepare('UPDATE user_profile SET is_verified=?,updated_at=? WHERE user_id=?')->execute([$v,now_sql(),$uid]);}
        elseif($action==='ban'){$reason=clean_string(input('reason',''));$v=$reason!==''?1:(truthy(input('is_banned',false))?1:0);$pdo->prepare('UPDATE users SET is_banned=?,ban_reason=? WHERE id=?')->execute([$v,$reason,$uid]);}
        elseif($action==='role'){$role=clean_string(input('role','user'));$pdo->prepare('UPDATE users SET role=?,is_admin=? WHERE id=?')->execute([$role,$role==='admin'?1:0,$uid]);}
        elseif($action==='password'){$pw=(string)input('newPassword',input('password',''));if(strlen($pw)<6)fail('Password 6+ chars');$pdo->prepare('UPDATE users SET password_hash=?,password=NULL WHERE id=?')->execute([password_hash($pw,PASSWORD_BCRYPT),$uid]);}
        response_json(['ok'=>true,'user'=>user_profile_row($uid)]);
    }
    if(preg_match('#^/admin/users/([^/]+)$#',$path,$mm)&&$meth==='DELETE'){ $uid=(int)$mm[1];if($uid===(int)$admin['id'])fail('Cannot delete yourself');afu_delete_account_data($uid);response_json(['ok'=>true]); }
    if(preg_match('#^/admin/posts/([^/]+)$#',$path,$mm)&&$meth==='DELETE'){ $id=(int)preg_replace('/\D+/','',$mm[1]);$pdo->prepare('DELETE FROM posts WHERE id=?')->execute([$id]);response_json(['ok'=>true]); }
    if(preg_match('#^/admin/listings/([^/]+)/(approve|reject|pending)$#',$path,$mm)&&in_array($meth,['PATCH','POST'],true)){
        $target=moderation_target(rawurldecode($mm[1]));$action=$mm[2];$reason=clean_string(input('reason',''));
        if(!$target) fail('Listing not found',404);
        if($reason==='' && $action==='approve')$reason='Reviewed and approved.'; elseif($reason==='') fail('Admin review note required');
        if($target['kind']==='marketplace'){
            $st=$pdo->prepare('SELECT * FROM marketplace_listings WHERE id=? OR public_id=? LIMIT 1');$st->execute([$target['id'],$target['id']]);
        }else{
            $st=$pdo->prepare('SELECT * FROM '.$target['table'].' WHERE id=? LIMIT 1');$st->execute([$target['id']]);
        }
        $r=$st->fetch();if(!$r)fail('Listing not found',404);
        if($action==='approve' && $target['kind']==='places' && !public_place_has_required_fields($r)){
            fail('Place cannot be approved: check the street number and address, city, two-letter state, and a Google Maps URL matching that exact location. Save edits first, then approve.',422);
        }
        $status=$action==='approve'?'approved':($action==='reject'?'rejected':'pending');$ts=now_sql();
        if($target['kind']==='marketplace'){
            $pdo->prepare("UPDATE marketplace_listings SET status=?,is_active=?,admin_reason=?,reviewed_by=?,reviewed_at=?,updated_at=? WHERE id=?")->execute([$status,$status==='approved'?1:0,$reason,$admin['id'],$ts,$ts,(int)$r['id']]);
        }else{
            $pdo->prepare('UPDATE '.$target['table'].' SET status=?,admin_reason=?,reviewed_by=?,reviewed_at=?,updated_at=? WHERE id=?')->execute([$status,$reason,$admin['id'],$ts,$ts,(int)$r['id']]);
        }
        $ownerId=moderation_owner_id($target,$r);$publicLink=moderation_public_link($target,$r);
        $eventType=$status==='approved'?'approved':($status==='rejected'?'rejected':'returned_to_pending');
        moderation_event($target['kind'],$target['id'],$ownerId,$eventType,strtolower((string)($r['status']??'')),$status,$reason,(int)$admin['id']);
        if($ownerId!==(int)$admin['id'] && $status==='approved') notify_user($ownerId,'Listing approved',$reason,'listing_approved','/my-requests');
        elseif($ownerId!==(int)$admin['id'] && $status==='rejected') notify_user($ownerId,'Listing needs changes',$reason,'listing_rejected','/my-requests');
        elseif($ownerId!==(int)$admin['id']) notify_user($ownerId,'Listing returned to review',$reason,'listing_pending','/my-requests');
        response_json(['ok'=>true,'status'=>$status,'id'=>$target['raw']]);
    }
    if(preg_match('#^/admin/listing-changes/([^/]+)/(approve|reject|pending)$#',$path,$mm)&&in_array($meth,['PATCH','POST'],true)){
        $cid=(int)$mm[1];$action=$mm[2];$reason=clean_string(input('reason',''));
        $st=$pdo->prepare('SELECT * FROM marketplace_listing_changes WHERE id=? LIMIT 1');$st->execute([$cid]);$c=$st->fetch();
        if(!$c)fail('Change request not found',404);if($reason==='')fail('Admin review note required');
        $source=strtolower(clean_string($c['source_type']??'marketplace'));
        $target=$source==='places'?['kind'=>'places','table'=>'community_places','id'=>(int)$c['listing_id'],'raw'=>'place_'.(int)$c['listing_id']]:($source==='groups'?['kind'=>'groups','table'=>'community_groups','id'=>(int)$c['listing_id'],'raw'=>'group_'.(int)$c['listing_id']]:['kind'=>'marketplace','table'=>'marketplace_listings','id'=>(int)$c['listing_id'],'raw'=>(string)$c['listing_id']]);
        $previousStatus=strtolower((string)($c['status']??'pending'));
        if($action==='approve'){
            // Apply the payload only when it has not already been applied by an earlier approval.
            if($previousStatus!=='approved'){
                $payload=json_decode((string)$c['payload_json'],true)?:[];$sets=[];$vals=[];
                if($target['kind']==='marketplace'){
                    $allowed=['type','title','city','state','link','contact','currency','price_type','price_value','platform','topic','notes','description','price','website','address','category','phone','whatsapp','email','car_year','car_mileage','bedrooms','bathrooms','job_type','status_label','images_json'];
                    foreach($allowed as $f){if(array_key_exists($f,$payload)){$sets[]="`$f`=?";$vals[]=$payload[$f];}}
                }elseif($target['kind']==='places'){
                    $allowed=['name','category','city','state','address','phone','website','notes','images'];
                    foreach($allowed as $f){if(array_key_exists($f,$payload)){$sets[]="`$f`=?";$v=$payload[$f];$vals[]=($f==='images'&&is_array($v))?json_encode(array_values($v),JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE):$v;}}
                }else{
                    $allowed=['name','platform','link','city','state','topic','notes'];
                    foreach($allowed as $f){if(array_key_exists($f,$payload)){$sets[]="`$f`=?";$vals[]=$payload[$f];}}
                }
                if($sets){$sets[]='updated_at=?';$vals[]=now_sql();$vals[]=(int)$c['listing_id'];$pdo->prepare('UPDATE '.$target['table'].' SET '.implode(',',$sets).' WHERE id=?')->execute($vals);}
            }
            $pdo->prepare("UPDATE marketplace_listing_changes SET status='approved',admin_reason=?,reviewed_by=?,reviewed_at=? WHERE id=?")->execute([$reason,$admin['id'],now_sql(),$cid]);
            moderation_event($source.'_change',$cid,(int)$c['user_id'],'approved',$previousStatus,'approved',$reason,(int)$admin['id'],['listing_id'=>(int)$c['listing_id']]);
            notify_user((int)$c['user_id'],'Listing changes approved',$reason,'listing_change_approved','/my-requests');
            $finalStatus='approved';
        }elseif($action==='reject'){
            $pdo->prepare("UPDATE marketplace_listing_changes SET status='rejected',admin_reason=?,reviewed_by=?,reviewed_at=? WHERE id=?")->execute([$reason,$admin['id'],now_sql(),$cid]);
            moderation_event($source.'_change',$cid,(int)$c['user_id'],'rejected',$previousStatus,'rejected',$reason,(int)$admin['id'],['listing_id'=>(int)$c['listing_id']]);
            notify_user((int)$c['user_id'],'Listing changes rejected',$reason,'listing_change_rejected','/my-requests');
            $finalStatus='rejected';
        }else{
            $pdo->prepare("UPDATE marketplace_listing_changes SET status='pending',admin_reason=NULL,reviewed_by=NULL,reviewed_at=NULL,created_at=? WHERE id=?")->execute([now_sql(),$cid]);
            moderation_event($source.'_change',$cid,(int)$c['user_id'],'returned_to_pending',$previousStatus,'pending',$reason,(int)$admin['id'],['listing_id'=>(int)$c['listing_id']]);
            notify_user((int)$c['user_id'],'Changes returned to review',$reason,'listing_change_pending','/my-requests');
            $finalStatus='pending';
        }
        $verify=$pdo->prepare('SELECT status FROM marketplace_listing_changes WHERE id=?');$verify->execute([$cid]);$verified=strtolower((string)$verify->fetchColumn());
        if($verified!==$finalStatus)fail('Moderation status change was not persisted',500);
        response_json(['ok'=>true,'status'=>$finalStatus,'id'=>$cid]);
    }
    // Native unified dashboard card editor (admin only). Partial update of a strict
    // field whitelist; preserves owner, status, images and all unrelated data.
    if(preg_match('#^/admin/listings/([^/]+)$#',$path,$mm) && in_array($meth,['PATCH','PUT'],true)){
        $target=moderation_target(rawurldecode($mm[1]));if(!$target)fail('Listing not found',404);
        $st=$pdo->prepare('SELECT * FROM '.$target['table'].' WHERE id=? LIMIT 1');$st->execute([$target['id']]);$old=$st->fetch();
        if(!$old)fail('Listing not found',404);
        $data=input_all();
        $expected=(string)($data['expected_updated_at']??'');
        if($expected!=='' && $expected!==(string)($old['updated_at']??''))fail('This listing was updated elsewhere. Refresh and try again.',409);
        $allowed=$target['kind']==='marketplace'
            ? ['title','category','description','city','state','address','phone','email','website','link','contact','notes','price_value']
            : ($target['kind']==='places'
                ? ['name','category','address','city','state','phone','website','google_maps_url','notes']
                : ['name','platform','topic','link','city','state','notes']);
        $sets=[];$params=[];$changed=[];
        foreach($allowed as $field){
            if(!array_key_exists($field,$data))continue;
            $value=clean_string($data[$field]);
            if(mb_strlen($value)>20000)fail('Field too long: '.$field,400);
            if($field==='price_value' && $value!=='' && !is_numeric($value))fail('Invalid price',400);
            if((string)($old[$field]??'')===$value)continue;
            $sets[]='`'.$field.'`=?';$params[]=$value;$changed[]=$field;
        }
        if(!$sets)response_json(['ok'=>true,'unchanged'=>true]);
        $sets[]='updated_at=?';$params[]=now_sql();$params[]=(int)$old['id'];
        $pdo->prepare('UPDATE '.$target['table'].' SET '.implode(',',$sets).' WHERE id=?')->execute($params);
        // Keep the moderation state unchanged. Record who changed the item.
        moderation_event($target['kind'],$target['id'],moderation_owner_id($target,$old),'admin_edited',
            (string)($old['status']??'approved'),(string)($old['status']??'approved'),
            'Admin updated listing fields',(int)$admin['id'],['fields'=>$changed]);
        response_json(['ok'=>true,'id'=>$target['raw'],'updated_fields'=>$changed]);
    }
    if(preg_match('#^/admin/listings/([^/]+)$#',$path,$mm)&&$meth==='DELETE'){
        $target=moderation_target(rawurldecode($mm[1]));if(!$target)fail('Listing not found',404);
        afu_atomic_write($pdo, function() use ($pdo, $target) {
            if ($target['kind']==='marketplace') {
                $pdo->prepare('DELETE FROM marketplace_listing_changes WHERE source_type=? AND listing_id=?')->execute(['marketplace',$target['id']]);
                $pdo->prepare('DELETE FROM marketplace_reviews WHERE listing_id=?')->execute([$target['id']]);
                // Delete by the canonical verified ID only, not by an ambiguous OR public_id.
                $pdo->prepare('DELETE FROM marketplace_listings WHERE id=?')->execute([$target['id']]);
            } else {
                $reviewTable=$target['kind']==='places'?'place_reviews':'group_reviews';
                $fk=$target['kind']==='places'?'place_id':'group_id';
                $pdo->prepare("DELETE FROM $reviewTable WHERE $fk=?")->execute([$target['id']]);
                $pdo->prepare('DELETE FROM marketplace_listing_changes WHERE source_type=? AND listing_id=?')->execute([$target['kind'],$target['id']]);
                $pdo->prepare('DELETE FROM '.$target['table'].' WHERE id=?')->execute([$target['id']]);
            }
        });
        response_json(['ok'=>true]);
    }
    if($path==='/admin/update-suggestions' && $meth==='GET'){
        // Optional community_places columns differ in older production schemas.
        // Never require address/phone/website to load the suggestion queue.
        // If the suggestions table itself is unavailable, retain a real API error;
        // an absent table is NOT the same as zero suggestions.
        $status=clean_string($_GET['status']??'');
        $sql="SELECT s.*,p.name AS place_name,p.city AS place_city,p.state AS place_state,u.username AS submitter_username,u.email AS submitter_email FROM entity_update_suggestions s LEFT JOIN community_places p ON p.id=s.entity_id AND s.entity_type='place' LEFT JOIN users u ON u.id=s.submitter_id";
        $params=[];
        if($status!==''){$sql.=' WHERE s.status=?';$params[]=$status;}
        $sql.=" ORDER BY CASE WHEN s.status='pending' THEN 0 ELSE 1 END,s.id DESC";
        $st=$pdo->prepare($sql);$st->execute($params);
        $rows=$st->fetchAll();
        foreach($rows as &$r){$r['images']=json_array($r['images_json']??'[]');afu_suggestion_decorate($pdo,$r);}unset($r);
        response_json(['suggestions'=>$rows,'items'=>$rows]);
    }
    // Soft, reversible admin actions: publish only separate contribution; revoke hides it;
    // undo rejection returns to pending; remove archives without deleting audit.
    if(preg_match('#^/admin/update-suggestions/(\d+)/(revoke|restore|reopen|remove|unremove)$#',$path,$mm) && in_array($meth,['PATCH','POST'],true)) {
        $sid=(int)$mm[1];$action=$mm[2];$st=$pdo->prepare('SELECT * FROM entity_update_suggestions WHERE id=? LIMIT 1');$st->execute([$sid]);$sug=$st->fetch();if(!$sug)fail('Suggestion not found',404);
        $previous=strtolower((string)($sug['status']??'pending'));$reason=clean_string(input('reason',input('admin_reason','')));
        $rules=['revoke'=>['approved','revoked'],'restore'=>['revoked','approved'],'reopen'=>['rejected','pending'],'remove'=>[null,'removed'],'unremove'=>['removed','pending']];
        [$from,$to]=$rules[$action];if($from!==null && $previous!==$from)fail('Invalid transition for this suggestion',409);
        if($action==='remove' && !in_array($previous,['pending','rejected','approved','revoked'],true))fail('Cannot remove suggestion in this status',409);
        if($reason==='')fail('Write an admin reason for this action',422);
        $upd=$pdo->prepare('UPDATE entity_update_suggestions SET status=?,admin_reason=?,reviewed_by=?,reviewed_at=? WHERE id=? AND status=?');
        $upd->execute([$to,$reason,$admin['id'],now_sql(),$sid,$previous]);if(!$upd->rowCount())fail('Suggestion changed; reload',409);
        moderation_event('place_suggestion',$sid,(int)$sug['submitter_id'],$action,$previous,$to,$reason,(int)$admin['id'],['place_id'=>(int)$sug['entity_id']]);
        notify_user((int)$sug['submitter_id'],'Place suggestion status changed',$reason,'place_update_'.$to,'/my-requests');
        response_json(['ok'=>true,'status'=>$to,'id'=>$sid]);
    }
    if(preg_match('#^/admin/update-suggestions/(\d+)/(approve|reject)$#',$path,$mm)&&in_array($meth,['PATCH','POST'],true)){
        $sid=(int)$mm[1];$action=$mm[2];$reason=clean_string(input('reason',input('admin_reason','')));$st=$pdo->prepare('SELECT * FROM entity_update_suggestions WHERE id=? LIMIT 1');$st->execute([$sid]);$sug=$st->fetch();if(!$sug)fail('Suggestion not found',404);$previous=strtolower((string)($sug['status']??'pending'));
        if($action==='approve'&&$previous!=='approved'){
            if($previous!=='pending')fail('Return a rejected suggestion to review before approving',409);
            $placeId=(int)$sug['entity_id'];$field=strtolower((string)$sug['field_name']);$value=(string)($sug['proposed_value']??'');$allowed=['phone','website','google_maps_url','address','city','email','hours','notes'];
            // Additive approval: original name, address, contact, notes and photos remain untouched.
            // The public approved-updates endpoint displays separately moderated contributions.
            // Legacy suggestions approved in <=6.1.33 might already have modified canonical fields;
            // NEVER blindly revert those historic changes without a verified before-snapshot.
            $upd=$pdo->prepare("UPDATE entity_update_suggestions SET status='approved',admin_reason=?,reviewed_by=?,reviewed_at=?,applied_at=? WHERE id=? AND status='pending'");$upd->execute([$reason,$admin['id'],now_sql(),now_sql(),$sid]);if(!$upd->rowCount())fail('Suggestion changed; reload',409);moderation_event('place_suggestion',$sid,(int)$sug['submitter_id'],'approved',$previous,'approved',$reason,(int)$admin['id'],['place_id'=>(int)$sug['entity_id']]);notify_user((int)$sug['submitter_id'],'Place update approved',$reason!==''?$reason:'Thank you. Your suggested information was approved.','place_update_approved','/my-requests');response_json(['ok'=>true,'status'=>'approved','id'=>$sid]);
        }
        if($action==='approve'&&$previous==='approved')response_json(['ok'=>true,'status'=>'approved','id'=>$sid,'already'=>true]);
        if($previous!=='pending')fail('Only pending suggestions may be rejected; approved changes cannot be silently undone',409);
        if($reason==='')fail('Write a rejection reason for the submitter',422);
        $pdo->prepare("UPDATE entity_update_suggestions SET status='rejected',admin_reason=?,reviewed_by=?,reviewed_at=? WHERE id=? AND status='pending'")->execute([$reason,$admin['id'],now_sql(),$sid]);moderation_event('place_suggestion',$sid,(int)$sug['submitter_id'],'rejected',$previous,'rejected',$reason,(int)$admin['id'],['place_id'=>(int)$sug['entity_id']]);notify_user((int)$sug['submitter_id'],'Place update needs changes',$reason,'place_update_rejected','/my-requests');response_json(['ok'=>true,'status'=>'rejected','id'=>$sid]);
    }
    if(preg_match('#^/admin/reports/([^/]+)$#',$path,$mm)&&$meth==='PATCH'){ $pdo->prepare('UPDATE reports SET status=? WHERE id=?')->execute([clean_string(input('status','dismissed')),(int)$mm[1]]);response_json(['ok'=>true]); }
    if(preg_match('#^/admin/reports/([^/]+)$#',$path,$mm)&&$meth==='DELETE'){ $pdo->prepare('DELETE FROM reports WHERE id=?')->execute([(int)$mm[1]]);response_json(['ok'=>true]); }
    if(preg_match('#^/admin/appeals/([^/]+)$#',$path,$mm)&&$meth==='DELETE'){ $pdo->prepare('DELETE FROM appeals WHERE id=?')->execute([(int)$mm[1]]);response_json(['ok'=>true]); }
    if(preg_match('#^/admin/verifications/([^/]+)$#',$path,$mm)&&$meth==='PATCH'){ $id=(int)$mm[1];$status=clean_string(input('status','approved'));$reason=clean_string(input('reject_reason',input('reason','')));$st=$pdo->prepare('SELECT user_id FROM verification_requests WHERE id=?');$st->execute([$id]);$uid=(int)$st->fetchColumn();$pdo->prepare('UPDATE verification_requests SET status=?,reject_reason=? WHERE id=?')->execute([$status,$reason,$id]);if($uid&&$status==='approved'){$pdo->prepare('UPDATE users SET is_verified=1 WHERE id=?')->execute([$uid]);ensure_user_profile($uid);$pdo->prepare('UPDATE user_profile SET is_verified=1 WHERE user_id=?')->execute([$uid]);}response_json(['ok'=>true]); }
    if(preg_match('#^/admin/glossary/([^/]+)/(approve|reject)$#',$path,$mm)&&in_array($meth,['PATCH','POST'],true)){ $status=$mm[2]==='approve'?'approved':'rejected';$pdo->prepare('UPDATE glossary_terms SET status=?,approved_by=?,updated_at=? WHERE id=?')->execute([$status,$admin['id'],now_sql(),(int)$mm[1]]);response_json(['ok'=>true]); }
    if(preg_match('#^/admin/resources/([^/]+)/(approve|reject)$#',$path,$mm)&&in_array($meth,['PATCH','POST'],true)){ $status=$mm[2]==='approve'?'approved':'rejected';$pdo->prepare('UPDATE resource_entities SET status=?,approved_by=?,updated_at=? WHERE id=?')->execute([$status,$admin['id'],now_sql(),(int)$mm[1]]);response_json(['ok'=>true]); }
    if(preg_match('#^/admin/glossary/([^/]+)$#',$path,$mm) && in_array($meth,['PUT','PATCH'],true)){ $id=(int)$mm[1];$d=input_all();if(array_key_exists('aliases',$d))$d['aliases_json']=json_encode(is_array($d['aliases'])?$d['aliases']:[],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);$allowed=['slug','term','category','definition_ar','definition_en','definition_es','example_ar','example_en','example_es','pron_ar','basics_group','aliases_json','source_url','status','submission_note','is_featured'];$sets=[];$vals=[];foreach($allowed as $f){if(array_key_exists($f,$d)){$sets[]="`$f`=?";$vals[]=$f==='is_featured'?(truthy($d[$f])?1:0):(is_array($d[$f])?json_encode($d[$f],JSON_UNESCAPED_UNICODE):$d[$f]);}}if($sets){$sets[]='updated_at=?';$vals[]=now_sql();$vals[]=$id;$pdo->prepare('UPDATE glossary_terms SET '.implode(',',$sets).' WHERE id=?')->execute($vals);}response_json(['ok'=>true]); }
    if((preg_match('#^/admin/glossary/([^/]+)/delete$#',$path,$mm) && $meth==='POST') || (preg_match('#^/admin/glossary/([^/]+)$#',$path,$mm) && $meth==='DELETE')){ if($meth==='POST' && ($_SERVER['HTTP_X_AFU_ACTION']??'')!=='delete-confirmed')fail('Delete confirmation header required',403); if(!ctype_digit($mm[1]))fail('Invalid delete target ID',400);$id=(int)$mm[1];if($id<=0)fail('Invalid glossary ID',400);$stmt=$pdo->prepare('DELETE FROM glossary_terms WHERE id=?');$stmt->execute([$id]);if($stmt->rowCount()!==1)fail('Glossary item was not found',404);response_json(['ok'=>true,'deleted_id'=>$id]); }
    if(preg_match('#^/admin/resources/([^/]+)$#',$path,$mm) && in_array($meth,['PUT','PATCH'],true)){ $id=(int)$mm[1];$d=input_all();$allowed=['category','slug','name','description','website_url','referral_url','logo_url','state_code','coverage_label','tags_json','status','submission_note','is_featured','is_official','verified_at'];$sets=[];$vals=[];foreach($allowed as $f){if(array_key_exists($f,$d)){$sets[]="`$f`=?";$vals[]=in_array($f,['is_featured','is_official'],true)?(truthy($d[$f])?1:0):(is_array($d[$f])?json_encode($d[$f],JSON_UNESCAPED_UNICODE):$d[$f]);}}if($sets){$sets[]='updated_at=?';$vals[]=now_sql();$vals[]=$id;$pdo->prepare('UPDATE resource_entities SET '.implode(',',$sets).' WHERE id=?')->execute($vals);}response_json(['ok'=>true]); }
    if((preg_match('#^/admin/resources/([^/]+)/delete$#',$path,$mm) && $meth==='POST') || (preg_match('#^/admin/resources/([^/]+)$#',$path,$mm) && $meth==='DELETE')){ if($meth==='POST' && ($_SERVER['HTTP_X_AFU_ACTION']??'')!=='delete-confirmed')fail('Delete confirmation header required',403); if(!ctype_digit($mm[1]))fail('Invalid delete target ID',400);$id=(int)$mm[1];if($id<=0)fail('Invalid resource ID',400);$stmt=$pdo->prepare('DELETE FROM resource_entities WHERE id=?');$stmt->execute([$id]);if($stmt->rowCount()!==1)fail('Resource was not found',404);response_json(['ok'=>true,'deleted_id'=>$id]); }
    if(preg_match('#^/admin/state-resources/([^/]+)$#',$path,$mm) && $meth==='GET'){ $v=rawurldecode($mm[1]);$st=$pdo->prepare('SELECT * FROM state_resources WHERE state_code=? OR state_name=? LIMIT 1');$st->execute([$v,$v]);$r=$st->fetch();response_json($r?:[]); }
    if(preg_match('#^/admin/state-resources/([^/]+)$#',$path,$mm) && in_array($meth,['PUT','PATCH','POST'],true)){ $code=strtoupper(rawurldecode($mm[1]));$d=input_all();$st=$pdo->prepare('SELECT state_code FROM state_resources WHERE state_code=?');$st->execute([$code]);if($st->fetchColumn()){ $allowed=['state_name','dmv_name','dmv_url','manual_url','source_url','verified_at'];$sets=[];$vals=[];foreach($allowed as $f){if(array_key_exists($f,$d)){$sets[]="`$f`=?";$vals[]=$d[$f];}}$sets[]='updated_at=?';$vals[]=now_sql();$vals[]=$code;$pdo->prepare('UPDATE state_resources SET '.implode(',',$sets).' WHERE state_code=?')->execute($vals);}else{$pdo->prepare('INSERT INTO state_resources (state_code,state_name,dmv_name,dmv_url,manual_url,source_url,verified_at,updated_at) VALUES (?,?,?,?,?,?,?,?)')->execute([$code,clean_string($d['state_name']??$code),clean_string($d['dmv_name']??''),clean_string($d['dmv_url']??''),clean_string($d['manual_url']??''),clean_string($d['source_url']??''),clean_string($d['verified_at']??''),now_sql()]);}response_json(['ok'=>true]); }
}

require __DIR__ . '/compat.php';

fail('API route not found: '.$meth.' '.$path,404);
