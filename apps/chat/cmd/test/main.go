package main

import (
	"bytes"
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Person struct {
	Name string
	Age  int
}

var jhon = Person{Name: "John", Age: 30}
var intset = IntSet{}

func main() {
	fmt.Println("Go Context")
	// ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	// defer cancel()

	// ctx = addPersonToContext(ctx, &jhon)

	intset.Add(1)
	intset.Add(16)
	intset.Add(120)
	fmt.Println(intset.words)
	fmt.Println(intset.Has(1))
	fmt.Println(intset.Has(2))
	fmt.Println(intset.Has(16))
	fmt.Println(intset.Has(120))
	fmt.Println(intset.Has(1230))

	// go doSomeThing(ctx)
	// select {
	// case <-ctx.Done():
	// 	fmt.Println("Exeded the deadline")
	// }
	// time.Sleep(2 * time.Second)
}

func addPersonToContext(ctx context.Context, p *Person) context.Context {
	return context.WithValue(ctx, p, uuid.New())
}

func readPersonFromContext(ctx context.Context, p *Person) uuid.UUID {
	value := ctx.Value(p)
	if value == nil {
		return uuid.Nil
	}
	return value.(uuid.UUID)
}

func doSomeThing(ctx context.Context) {
	fmt.Println("Start doSomeThing")

loop_me_daddy:
	for {
		select {
		case <-ctx.Done():
			fmt.Println("Context Done")
			break loop_me_daddy
		default:
			jhonId := readPersonFromContext(ctx, &jhon)
			fmt.Printf("Jhon's UUID is %s\n", &jhonId)
		}
		time.Sleep(500 * time.Millisecond)
	}
	fmt.Println("End doSomeThing")
}

// An IntSet is a set of small non-negative integers.
// Its zero value represents the empty set.
type IntSet struct {
	words []uint64
}

// Has reports whether the set contains the non-negative value x.
func (s *IntSet) Has(x int) bool {
	word, bit := x/64, uint(x%64)
	return word < len(s.words) && s.words[word]&(1<<bit) != 0
}

// Add adds the non-negative value x to the set.
func (s *IntSet) Add(x int) {
	word, bit := x/64, uint(x%64)
	for word >= len(s.words) {
		s.words = append(s.words, 0)
	}
	s.words[word] |= 1 << bit
}

// UnionWith sets s to the union of s and t.
func (s *IntSet) UnionWith(t *IntSet) {
	for i, tword := range t.words {
		if i < len(s.words) {
			s.words[i] |= tword
		} else {
			s.words = append(s.words, tword)
		}
	}
}

//!-intset

//!+string

// String returns the set as a string of the form "{1 2 3}".
func (s *IntSet) String() string {
	var buf bytes.Buffer
	buf.WriteByte('{')
	for i, word := range s.words {
		if word == 0 {
			continue
		}
		for j := 0; j < 64; j++ {
			if word&(1<<uint(j)) != 0 {
				if buf.Len() > len("{") {
					buf.WriteByte(' ')
				}
				fmt.Fprintf(&buf, "%d", 64*i+j)
			}
		}
	}
	buf.WriteByte('}')
	return buf.String()
}

//!-string

/*
In Go, the fmt.Printf function uses a format string that can contain various format
specifiers denoted by the notation  %<letter> . Here are some commonly used format specifiers:

-  %s : Formats the argument as a string.
-  %d  or  %v : Formats the argument as an integer.
-  %f : Formats the argument as a floating-point number.
-  %t : Formats the argument as the boolean value true or false.
-  %b : Formats the argument as a binary representation.
-  %x  or  %X : Formats the argument as a hexadecimal representation.
-  %o : Formats the argument as an octal representation.
-  %c : Formats the argument as a Unicode character.
-  %p : Formats the argument as a pointer address.
-  %v : Formats the argument in a default format based on its type.
*/
