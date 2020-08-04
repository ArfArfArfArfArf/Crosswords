package main
import (
  "bytes"
	"compress/gzip"
	"errors"
	"io/ioutil"
	"log"
  "net/http"
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

func findWSJUrl(date string) (string, error) {
	resp, err := http.Get("http://blogs.wsj.com/puzzle/")

	if err != nil {
		return "", err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	year, month, monthDay := splitDate(date)
	
	t := time.Date(year, time.Month(month), monthDay, 12, 0, 0, 0, time.UTC)

	reg := `a href="(.*)">.*` + t.Weekday().String() + `.*Crossword`

	re := regexp.MustCompile(reg)

	match := re.FindStringSubmatch(string(body))

	resp.Body.Close();
	
	if (len(match) == 2) {
		resp, err := http.Get(match[1])

		if err != nil {
			return "", err
		}
		
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return "", err
		}

		resp.Body.Close()
		
		reg := `a href="//blogs.wsj.com/puzzle/crossword/(\d+)/(\d+)/index.html" target="_blank" .* class="puzzle-link"`
		re := regexp.MustCompile(reg)

		match := re.FindStringSubmatch(string(body))
		
		if (len(match) == 3) {
			return "https://blogs.wsj.com/puzzle/crossword/" + match[1] + "/" + match[2] + "/data.json", nil
		}
	}
	
	return "", nil
}

func findPuzzle(puzzle, date string) (string, error) {
	switch puzzle {
	case "LAT":
		return "http://cdn.games.arkadiumhosted.com/latimes/assets/DailyCrossword/la" + date + ".xml", nil
	case "WSJ":
		url, err := findWSJUrl(date)
		return url, err
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
	
	url, err := findPuzzle(s[0], s[1])

	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		
		return;
	}

	req, err := http.NewRequest("GET", url, nil)
	
	transport := http.Transport{}

	var resp *http.Response
	
	for resp == nil {
		loopR, err := transport.RoundTrip(req)

		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return;
		}

		if (loopR.StatusCode == 302) {
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
