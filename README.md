# Društvena mreža za muzičare

Nikola Šarić SW60-2016

# Specifikacija projekta:

Web platforma za muzičare, na kojoj mogu da kače svoje video i audio zapise, i obaveštenja u vidu teksta ili slika. Da bi mogli da postavljaju svoje objave, korisnici moraju da se registruju na sistem. Takođe, mogu da prate ostale korisnike i postavljaju komentare i reakcije na njihove objave.

Back-end je baziran na arhitekturi mikroservisa napisanih u Python i GoLang programskim jezicima, a front-end je monolitna Angular aplikacija.

# Plan izrade projekta:

1) User servis - Python + Flask mikroservis aplikacija, MySQL baza podataka. Servis za registraciju i prijavljivanje korisnika.
Nakon uspesne registracije korisniku treba da stigne email preko koga treba da verifikuje unetu email adresu, tada mu se aktivira nalog i može da se uloguje.
Nakon uspešnog prijavljivanja korisniku se generiše JWT token, koji se koristi za dalju autentikaciju korisnika u ostalim mikroservisima.

2) Post Servis - GoLang mikroservis, MongoDB baza podataka. Servis za postavljanje i dobavljanje korisničkih objava.
Korisnička objava može sadržati naslov, jednu od ponuđenih kategorija, tagove, deskripciju, listu instrumenata, i jedan od sledećih fajlova
video, audio, sliku ili link. 
Post servis sadrži i metode za pretragu objava, po raznim kriterijumima.

3) Comment Servis - Servis za čuvanje i dobavljanje komentara, svaka objava može imati komentar, sem ako autor to nije eksplicitno zabranio.
Komentar može imati svoje komentare. Komentar može sadržati tekst ili link ka drugoj objavi.

4) Follow Servis - Servis za čuvanje praćenih korisnika. - jos nije detaljno razrađen, možda bude sklopljen sa User Servisom.

5) Reaction Servis - Servis za čuvanje reakcija na objave - još nije detaljno razrađen, možda bude sklopljen sa Post Servisom.

6) Streaming Servis - GoLang aplikacija za stream-ovanje video i audio zapisa skladištenih na serverskoj mašini.

Ostali servisi biće naknadno dodati i detaljno opisani, kao i način pokretanja projekta.

# Osnovne funkcionalnosti koje planiram da implementiram:

Korisnici:
  1) Registracija;
  2) Log In;
  3) Pregled korisničkog profila / izmena;
  
  4) Dodavanje objava koje mogu da sadrže tekst, slike, video ili audio zapis;
  5) Brisanje objave;
  6) Pretraživanje svojih i tuđih objava po raznim kriterijumima;
  7) Komentarisanje objava;
  8) Reakcije na objave;
  9) Praćenje ostalih korisnika;
  
 Administratori:
  10) Uklanjanje korisničkih objava;
  11) Blokiranje korisničkih profila;
