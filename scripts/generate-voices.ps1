# Cosmic Scrap voice pack generator
# Prompts for the ElevenLabs API key securely; the key is never written to disk.
$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\eymen\cosmic-scrap'
Set-Location $repo

$branch = (git branch --show-current).Trim()
if ($branch -ne 'feature/cosmic-scrap-music-system') {
  throw "Wrong branch: $branch. Expected feature/cosmic-scrap-music-system."
}
$workingTreeStatus = git status --porcelain
if ($workingTreeStatus -and $workingTreeStatus.Trim()) {
  throw 'Working tree is not clean. Commit/stash existing changes before generating assets.'
}

$secureKey = Read-Host 'ElevenLabs API key (hidden input)' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try { $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
if ([string]::IsNullOrWhiteSpace($apiKey)) { throw 'No API key supplied.' }

$model = 'eleven_multilingual_v2'
$voicePacks = @(
  @{
    gender='male'; language='tr'; voice='cPBqJ26VaZXIGAxXxtvc'
    lines=@(
      @{ file='mission-start.mp3'; text='Pilot, göreve hazır ol.' },
      @{ file='enemies-approaching.mp3'; text='Düşmanlar yaklaşıyor.' },
      @{ file='boss-start.mp3'; text='Boss savaşı başlıyor.' },
      @{ file='boss-defeated.mp3'; text='Boss etkisiz hale getirildi.' },
      @{ file='level-up.mp3'; text='Seviye yükseltildi.' },
      @{ file='sector-secured.mp3'; text='Bölge güvence altına alındı. İyi iş çıkardın.' }
    )
  },
  @{
    gender='female'; language='tr'; voice='Xen0soH4tcGo78ododZU'
    lines=@(
      @{ file='mission-start.mp3'; text='Pilot, göreve hazır ol.' },
      @{ file='enemies-approaching.mp3'; text='Düşmanlar yaklaşıyor.' },
      @{ file='boss-start.mp3'; text='Boss savaşı başlıyor.' },
      @{ file='boss-defeated.mp3'; text='Boss etkisiz hale getirildi.' },
      @{ file='level-up.mp3'; text='Seviye yükseltildi.' },
      @{ file='sector-secured.mp3'; text='Bölge güvence altına alındı. İyi iş çıkardın.' }
    )
  },
  @{
    gender='male'; language='en'; voice='exurTFaGNF2gnRcPNH8I'
    lines=@(
      @{ file='mission-start.mp3'; text='Pilot, prepare for deployment.' },
      @{ file='enemies-approaching.mp3'; text='Hostiles approaching.' },
      @{ file='boss-start.mp3'; text='Boss encounter initiated.' },
      @{ file='boss-defeated.mp3'; text='Boss neutralized.' },
      @{ file='level-up.mp3'; text='Level up.' },
      @{ file='sector-secured.mp3'; text='Sector secured. Excellent work.' }
    )
  },
  @{
    gender='female'; language='en'; voice='6EX2laahUbO3ntDUNBKu'
    lines=@(
      @{ file='mission-start.mp3'; text='Pilot, prepare for deployment.' },
      @{ file='enemies-approaching.mp3'; text='Hostiles approaching.' },
      @{ file='boss-start.mp3'; text='Boss encounter initiated.' },
      @{ file='boss-defeated.mp3'; text='Boss neutralized.' },
      @{ file='level-up.mp3'; text='Level up.' },
      @{ file='sector-secured.mp3'; text='Sector secured. Excellent work.' }
    )
  },
  @{
    gender='male'; language='pt-BR'; voice='oBihj8LAmKfHZ1oauBtA'
    lines=@(
      @{ file='mission-start.mp3'; text='Piloto, prepare-se para a missão.' },
      @{ file='enemies-approaching.mp3'; text='Inimigos se aproximando.' },
      @{ file='boss-start.mp3'; text='O combate contra o chefe começou.' },
      @{ file='boss-defeated.mp3'; text='Chefe neutralizado.' },
      @{ file='level-up.mp3'; text='Nível aumentado.' },
      @{ file='sector-secured.mp3'; text='Setor protegido. Excelente trabalho.' }
    )
  },
  @{
    gender='female'; language='pt-BR'; voice='B2J9b1PGBDt65GMZeYtU'
    lines=@(
      @{ file='mission-start.mp3'; text='Piloto, prepare-se para a missão.' },
      @{ file='enemies-approaching.mp3'; text='Inimigos se aproximando.' },
      @{ file='boss-start.mp3'; text='O combate contra o chefe começou.' },
      @{ file='boss-defeated.mp3'; text='Chefe neutralizado.' },
      @{ file='level-up.mp3'; text='Nível aumentado.' },
      @{ file='sector-secured.mp3'; text='Setor protegido. Excelente trabalho.' }
    )
  }
)

$total = 36
$done = 0
foreach ($pack in $voicePacks) {
  $folder = Join-Path $repo ("assets\sounds\voice\" + $pack.gender + "\" + $pack.language)
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
  foreach ($line in $pack.lines) {
    $done++
    $out = Join-Path $folder $line.file
    if (Test-Path $out) { Remove-Item -Force $out }
    $uri = "https://api.elevenlabs.io/v1/text-to-speech/$($pack.voice)?output_format=mp3_44100_128"
    $body = @{
      text = $line.text
      model_id = $model
      voice_settings = @{
        stability = 0.55
        similarity_boost = 0.80
        style = 0.20
        use_speaker_boost = $true
      }
    } | ConvertTo-Json -Depth 5 -Compress
    $attempt = 0
    while ($true) {
      $attempt++
      try {
        Invoke-WebRequest -Uri $uri -Method Post -Headers @{ 'xi-api-key' = $apiKey; 'Accept' = 'audio/mpeg' } -ContentType 'application/json' -Body $body -OutFile $out
        $info = Get-Item $out
        if ($info.Length -lt 1000) { throw "Audio output too small ($($info.Length) bytes)." }
        Write-Host "[$done/$total] OK $($pack.gender)/$($pack.language)/$($line.file) ($($info.Length) bytes)"
        break
      } catch {
        $status = 0
        try { $status = [int]$_.Exception.Response.StatusCode } catch {}
        if (($status -eq 429 -or $status -ge 500) -and $attempt -lt 7) {
          $wait = [Math]::Min(60, [Math]::Pow(2, $attempt) * 2)
          Write-Warning "HTTP $status; waiting $wait seconds before retry $attempt/6."
          Start-Sleep -Seconds $wait
          continue
        }
        if (Test-Path $out) { Remove-Item -Force $out }
        throw "Failed $($pack.gender)/$($pack.language)/$($line.file): $($_.Exception.Message)"
      }
    }
  }
}
$apiKey = $null
$secureKey.Dispose()

$files = Get-ChildItem (Join-Path $repo 'assets\sounds\voice') -Recurse -Filter '*.mp3'
if ($files.Count -ne $total) { throw "Expected $total MP3 files, found $($files.Count). Nothing committed." }
foreach ($f in $files) {
  if ($f.Length -lt 1000) { throw "Invalid/empty audio file: $($f.FullName)" }
}

git add assets/sounds/voice
git commit -m "Add multilingual male and female commander voice assets"
if ($LASTEXITCODE -ne 0) { throw 'Git commit failed.' }
git push origin feature/cosmic-scrap-music-system
if ($LASTEXITCODE -ne 0) { throw 'Push failed. Local commit is saved; push the feature branch after checking authentication.' }

Write-Host 'SUCCESS: all 36 voice MP3s generated, validated, committed and pushed to PR branch.'
