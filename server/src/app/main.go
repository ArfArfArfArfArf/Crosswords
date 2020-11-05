package main
import (
  "bytes"
	"compress/gzip"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
  "net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"
)

func splitDate(date string) (int, int, int) {
	year, _ := strconv.Atoi(date[0:2])
	year += 2000

	month, _ := strconv.Atoi(date[2:4])

	monthDay, _ := strconv.Atoi(date[4:6])

	return year, month, monthDay
}

func putInCache(name, date, url string) {
	ioutil.WriteFile("../../tmp/puzzles/" + name + "-" + date, []byte(url), 0644)
}

func getFromCache(name, date string) (string) {
	_, err := os.Stat("../../tmp/puzzles/" + name + "-" + date)
	if os.IsNotExist(err) == false {
		url, err := ioutil.ReadFile("../../tmp/puzzles/" + name + "-" + date)
		log.Println("Found cached url for " + name)
		if (err == nil) {
			return strings.TrimSuffix(string(url), "\n")
		}
	}	

	return "";
}

func findNYTUrl(name, date string) (string, error) {
	url := getFromCache(name, date)

	if url != "" {
		return url, nil
	}

	resp, err := http.Get("https://www.nytimes.com/crosswords/")
	if err != nil {
		return "", err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	reg := `svc/crosswords/v2/puzzle/(\d+)\.puz`

	re := regexp.MustCompile(reg)

	match := re.FindAllStringSubmatch(string(body), -1)

	
	resp.Body.Close()
	
	if len(match) == 3 {
		putInCache("NYTC1", date, "https://www.nytimes.com/svc/crosswords/v2/puzzle/" + match[0][1] + ".puz")
		putInCache("NYTC2", date, "https://www.nytimes.com/svc/crosswords/v2/puzzle/" + match[1][1] + ".puz")
		putInCache("NYTC3", date, "https://www.nytimes.com/svc/crosswords/v2/puzzle/" + match[2][1] + ".puz")

		if name == "NYTC1" {
			return "https://www.nytimes.com/svc/crosswords/v2/puzzle/" + match[0][1] + ".puz", nil
		} else if name == "NYTC2" {
			return "https://www.nytimes.com/svc/crosswords/v2/puzzle/" + match[1][1] + ".puz", nil
		} else if name == "NYTC3" {
			return "https://www.nytimes.com/svc/crosswords/v2/puzzle/" + match[2][1] + ".puz", nil
		}
	}

	return "", nil
}

func findBEQUrl(name, date string) (string, error) {
	url := getFromCache(name, date)

	if url != "" {
		return url, nil
	}

	resp, err := http.Get("http://www.brendanemmettquigley.com/")
	if err != nil {
		return "", err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	reg := "</span><a href=\"(.*)\"> <span style=\"font-size: 1.4em;\">ACROSS LITE</span>"

	re := regexp.MustCompile(reg)

	match := re.FindStringSubmatch(string(body))

	resp.Body.Close()

	if (len(match) > 1) {
		putInCache(name, date, match[1])
		return match[1], nil
	}

	return "", nil
}

func findWSJUrl(date string) (string, error) {
	url := getFromCache("WSJ", date)

	if url != "" {
		return url, nil
	}

	resp, err := http.Get("https://www.wsj.com/news/puzzle")

	if err != nil {
		return "", err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	year, month, monthDay := splitDate(date)
	
	t := time.Date(year, time.Month(month), monthDay, 12, 0, 0, 0, time.UTC)

	reg := `a.*href="(.*)">.*` + t.Weekday().String() + `.*Crossword.*` + strconv.Itoa(monthDay) + `\)`

	log.Println("REG: " + reg)
	
	re := regexp.MustCompile(reg)

	match := re.FindStringSubmatch(string(body))

	resp.Body.Close();
	
	if (len(match) == 2) {
		log.Println("Fetching: " + match[1])
		resp, err := http.Get(match[1])

		if err != nil {
			return "", err
		}
		
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return "", err
		}

		resp.Body.Close()
		
		reg := `s3.amazonaws.com/djcs-prod/public/blogs/puzzles/crossword/(\d+)\/(\d+)/index.html`

		re := regexp.MustCompile(reg)

		match := re.FindStringSubmatch(string(body))
		
	log.Println("Matches: ")
	log.Println(match)

		if (len(match) == 3) {
			url := "https://s3.amazonaws.com/djcs-prod/public/blogs/puzzles/crossword/" + match[1] + "/" + match[2] + "/data.json";
			
			/* save the url to a temp file */
			putInCache("WSJ", date, url);
			return url, nil
		}
	}
	
	return "", nil
}

func findPuzzle(puzzle, year, month, day string) (string, error) {
	y, _ := strconv.Atoi(year);
	y -= 2000;
	m, _ := strconv.Atoi(month);
	d, _ := strconv.Atoi(day);

	date := fmt.Sprintf("%02d%02d%02d", y, m, d)

	/*  NYT_DAILY: "NYTD",
  WSJ: "WSJ",
*/
	switch puzzle {
	case "PD":
		return "http://ams.cdn.arkadiumhosted.com/assets/gamesfeed/penny-dell//daily-crossword/puzzle_" + date + ".xml", nil
	case "ARK":
		return "http://cdn.arenaconnect.arkadiumhosted.com/clients/Boatload/puzzle_" + date + ".xml", nil
	case "BG":
		return "https://www.bostonglobe.com/games-comics/crossword/", nil
	case "KFS":
		newDate := fmt.Sprintf("%04d%02d%02d", y + 2000, m, d)
		return "http://puzzles.kingdigital.com/jpz/Premier/" + newDate + ".jpz", nil
	case "J":
		return "http://herbach.dnsalias.com/Jonesin/jz" + date + ".puz", nil
	case "NYTC1":
		return findNYTUrl(puzzle, date)
	case "NYTC2":
		return findNYTUrl(puzzle, date)
	case "NYTC3":
		return findNYTUrl(puzzle, date)
	case "BEQT":
		return findBEQUrl(puzzle, date)
	case "BEQF":
		return findBEQUrl(puzzle, date)
	case "SD":
		newDate := fmt.Sprintf("%04d%02d%02d", y + 2000, m, d)
		return "http://puzzles.kingdigital.com/jpz/Sheffer/" + newDate + ".jpz", nil
	case "JD":
		newDate := fmt.Sprintf("%04d%02d%02d", y + 2000, m, d)
		return "http://puzzles.kingdigital.com/jpz/Joseph/" + newDate + ".jpz", nil
	case "OC1":
		return "http://www.onlinecrosswords.net/en/puzzle.php?p=1", nil
	case "OC2":
		return "http://www.onlinecrosswords.net/en/puzzle.php?p=2", nil
	case "OC3":
		return "http://www.onlinecrosswords.net/en/puzzle.php?p=3", nil
	case "OC4":
		return "http://www.onlinecrosswords.net/en/puzzle.php?p=4", nil
	case "OC5":
		return "http://www.onlinecrosswords.net/en/puzzle.php?p=5", nil
	case "OC6":
		return "http://www.onlinecrosswords.net/en/puzzle.php?p=6", nil
	case "OC7":
		return "http://www.onlinecrosswords.net/en/puzzle.php?p=7", nil
	case "DA":
		return "https://ams.cdn.arkadiumhosted.com/assets/gamesfeed/bestforpuzzles-ftp/dailyamericancrossword/daily-american-" + date + ".xml", nil
	case "USAT":
		return "http://www.uclick.com/puzzles/usaon/data/usaon" + date + "-data.xml", nil
	case "LAT":
		return "http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la" + date + ".xml", nil
	case "CS":
		return "http://www.brainsonly.com/servlets-newsday-crossword/newsdaycrossword?date=" + date, nil
	case "UNI":
		return "http://picayune.uclick.com/comics/fcx/data/fcx" + date + "-data.xml", nil
	case "WSJ":
		return findWSJUrl(date)
	case "NYT":
		year, _, _ := splitDate(date)
		return "http://www.nytimes.com/svc/crosswords/v2/puzzle/daily-" + strconv.Itoa(year) + "-" + date[2:4] + "-" + date[4:6] + ".puz", nil
	default:
		return "", errors.New("Unknown Puzzle")
	}
}

func gz(input []byte) []byte {
    var buf bytes.Buffer
    w := gzip.NewWriter(&buf)
    w.Write(input)
    w.Close()
    return buf.Bytes()
}

func handler(w http.ResponseWriter, r *http.Request) {
	puzzle := r.URL.Path[len("/puzzle/"):]

	s := strings.Split(puzzle, "/")
	
	url, err := findPuzzle(s[0], s[1], s[2], s[3])

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		
		return;
	}

	log.Println("URL: " + url);

	req, err := http.NewRequest("GET", url, nil)
	
	transport := http.Transport{}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36")
	req.Header.Set("Accept", "*")
	
	var resp *http.Response
	
	for resp == nil {
		loopR, err := transport.RoundTrip(req)

		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return;
		}

		if (loopR.StatusCode == 301) {
			url = loopR.Header.Get("Location")
			req, err = http.NewRequest("GET", url, nil)
		} else if (loopR.StatusCode == 200) {
			resp = loopR;
		} else {
			http.Error(w, err.Error(), http.StatusNotFound)
			return;
		}
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
	}

	w.Header().Set("Content-Type", "application/xml")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Expose-Headers", "Location")
	
	if strings.Contains(strings.ToLower(r.Header.Get("TE")), "gzip") {
		w.Header().Set("Transfer-Encoding", "gzip")
		w.Write(gz(body))
	} else {
		w.Write(body)
	}
}

func main() {
  http.Handle("/puzzle/", http.HandlerFunc(handler));

  log.Fatal(http.ListenAndServe(":3001", nil))
}
